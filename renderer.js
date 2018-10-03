// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
let {applicationDimentions,usedObjects, descriptionPacket} = require('./interface.js');
let $ = require('jquery');
let {dialog, Menu, BrowserWindow} = require('electron').remote;
const fs = require('fs');
const mssql = require('mssql');
const preset = require('./settingspreset.js');

const CONNECTION_SUCCESS = "Connection successfully established!";
const CONNECTION_ERROR = "Connection not established";
const settingsFileEnc = './database_settings.enc';
 
let data = fs.existsSync(settingsFileEnc) ? JSON.parse(preset.DEncryptFile(settingsFileEnc,'r')) : preset.setting_template;

let DEFAULT_DBSERVER = 'mssql';

let settingWindow;

function showSettingWindow(){
  settingWindow = new BrowserWindow({width: 800, height: 260,parent:BrowserWindow.getAllWindows()[0],modal: true,resizable:false,autoHideMenuBar:true})

  // and load the index.html of the app.
  settingWindow.loadFile(`./settings.html`)
  //settingWindow.setMenu(null);
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  settingWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    settingWindow = null
  })
}

function setStyle(style){
    let stl;
    switch (style) {
        case 'standart':
            stl = "style.css"
            break;
        case 'dark':
            stl = 'dark_style.css';
        break;
        case 'light':
            stl = 'light_style.css';
        break;
    }
    $('#style').attr('href',stl);
    fs.writeFileSync('./style.json',`{"currentStyle":"${style}"}`,{flag:'w+'});
}

(function getStyle(){
    let ps = new Promise((resolve,reject)=>{
           let data = JSON.parse(fs.readFileSync('./style.json','utf8'));
           if (typeof(data) !== 'undefined'){
            resolve(data);
           } else {
            reject('readError');
           }
           
    });
    ps.then((result)=>{
        let stl;
        switch (result.currentStyle) {
            case 'standart':
            stl = "style.css"
            break;
            case 'dark':
                stl = 'dark_style.css';
            break;
            case 'light':
                stl = 'light_style.css';
            break;
        }
        $('body').append(`<link id ="style" rel="stylesheet" href="${stl}">`)
    });
    
})();



let template = [ //menu template
    {
      label:'Файл',
      submenu:[{
        label:'Настройка подключения к БД',
        accelerator:'Ctrl+Shift+S',
        click:()=>{
          showSettingWindow();
        }
      },
      {
        label:'Отчистить ввод',
        accelerator:'Ctrl+X',
        click:()=>{
          cleanupInput();
        }
      },
      {
        label:'Выгрузить в Access',
        accelerator:'Ctrl+U',
        click:()=>{
            baseUpload();
        }
        /*submenu:[{
            label:"Дополнить",
            click:()=>{
                baseUpload('append');
            }
        },
        {
            label:"Заменить",
            click:()=>{
                baseUpload('refresh');
            }
        }]*/
      },
      {
        label:'Загрузить из Access',
        accelerator:'Ctrl+D',
        click:()=>{
          baseDownload();
        }
      },
      {
        label:'Сгенерировать файл патча',
        accelerator:'Ctrl+P',
        click:()=>{
          generateFile();
        }
      }]
    },
    {
      label:'Приложения',
      submenu:[]
    },
    {
      label:"Тема",
      submenu:[{
        label:'Стандартная тема',
        accelerator:'Ctrl+Shift+T',
        click:()=>{
          setStyle('standart')
        }
      },
      {
        label:'Тёмная тема',
        accelerator:'Ctrl+Shift+D',
        click:()=>{
          setStyle('dark');
        }
      },
      {
        label:'Светлая тема',
        accelerator:'Ctrl+Shift+L',
        click:()=>{
         setStyle('light');
        }
      }]
    },
    {
      label: 'Окно',
      submenu: [{
        label: 'Обновить',
        accelerator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            // on reload, start fresh and close any old
            // open secondary windows
            if (focusedWindow.id === 1) {
              BrowserWindow.getAllWindows().forEach(win => {
                if (win.id > 1) win.close()
              })
            }
            focusedWindow.reload()
          }
        }
      }, {
        label: 'Резим "киоска" (Открыть на весь экран)',
        accelerator: (() => {
          if (process.platform === 'darwin') {
            return 'Ctrl+Command+F'
          } else {
            return 'F11'
          }
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
          }
        }
      }, {
        label: 'Консоль',
        accelerator: (() => {
          if (process.platform === 'darwin') {
            return 'Alt+Command+I'
          } else {
            return 'Ctrl+Shift+I'
          }
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.toggleDevTools()
          }
        }
      }
      ]}
];

function addAplication(){
    let arr = [];
    for (var item in applicationDimentions){
        arr.push(
            {
                label:item,
                accelerator:'Ctrl+Shift+'+item.split('')[2],
                click:(item, focusedWindow)=>{
                    if (focusedWindow) {
                        reDrawUsedObj(item);
                      }
                }
              }
        );
    }
    for (var ai in template){
        if (template[ai].label == 'Приложения'){
            template[ai].submenu = arr;
            break;
        }
    }
    
};

addAplication();

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

function reDrawUsedObj(obj){
   let cur = obj.label;
   usedObjects.group.data['dimentions'].list = applicationDimentions[cur];
   $('.container > div:nth-child(2)').remove();  
   drawInterface(usedObjects);
   applyRowAdding();
   alert('Выбранно приложение '+cur);
}

function drawInterface (obj){ // generate programm interface from json object (interface.js)
    let gr = obj.group;
    $(`.${obj.parent}`).append(`<div class="expander" name = "${gr.name}"></div>`);
    let groupParent = $(`div[name="${gr.name}"]`);
    $(groupParent).append(`<span class = "group-name">${gr.caption}</span>`);
   for (var ss in gr.data){
       switch (gr.data[ss].type) {
           case "text":
           case "date":
           $(groupParent).append(`
                <div class = "row">
                <span>${gr.data[ss].caption}</span>
                <input data-rv = "${ss}" name = "${ss}" type = "${gr.data[ss].type}" placeholder = "${gr.data[ss].caption}">
                </div>
                `);
               break;
           case "textarea":
           $(groupParent).append(`
                <div class = "row">
                <span>${gr.data[ss].caption}</span>
                <textarea data-rv = "${ss}" name = "${ss}" rows = "10" cols = "60" placeholder = "${gr.data[ss].caption}"></textarea>
                </div>
                `); 
               break;
           case "info":
           $(groupParent).append(`
                <div name = "${ss}-container">
                <div name = "${ss}" class = "row-info" type = "${gr.data[ss].type}">
                <span class="label">${gr.data[ss].caption}</span>
                <input data-rv = "${ss}-main" class ="data" type = "text" placeholder = "Объект/файл">
                <textarea data-rv = "${ss}-info" class = "info" rows="5" placeholder = "Описание"></textarea>
                <a class="next-row" data-rv = "${ss}"  data-append = "${ss}-container" href="#">+</a>
                </div>
                `);  
               break;
               case "info-select":
               let ul ='';
               for (var i = 0 ; i<gr.data[ss].list.length; i++){
                 ul +=`<li>${gr.data[ss].list[i]}</li>\n`;
               }
           $(groupParent).append(`
                <div name = "${ss}-container">
                <div name = "${ss}" class = "row-info" type = "${gr.data[ss].type}">
                <span class="label">${gr.data[ss].caption}</span>
                <div class = "select">
                    <input  data-rv = "${ss}-main" type="text" placeholder = "Объект/файл">
                    <a name = "list-show" class = "btn-show"></a>
                    <ul class = "closed">
                    ${ul}
                    </ul>
                </div>
                <textarea data-rv = "${ss}-info" class = "info" rows="5" placeholder = "Описание"></textarea>
                <a class="next-row" data-rv = "${ss}" data-append = "${ss}-container" href="#">+</a>
                </div>
                `);  
                document.querySelector('.select a[name="list-show"]')
                    .onclick = (event)=>{
                        if (event.target.getAttribute('class') == "btn-show"){
                        event.target.setAttribute('class','btn-close');
                        event.target.nextElementSibling.setAttribute('class','opened');
                        } else {
                        event.target.setAttribute('class', 'btn-show');
                        event.target.nextElementSibling.setAttribute('class','closed');
                        }
                    };
                    document.querySelectorAll('.select > ul > li').forEach((elem)=>{
                    elem.onclick = (event)=>{
                        event.target.parentNode.setAttribute('class','closed');
                        event.target.parentNode.previousElementSibling.setAttribute('class','btn-show');
                        event.target.parentNode.parentNode.firstElementChild.value = event.target.innerText;
                    };
                    });
               break;
           default:
               break;
       }
   }
};

drawInterface(descriptionPacket);
drawInterface(usedObjects);
applyRowAdding();
function applyRowAdding(){
$('div.row-info[type = "info"] > .next-row').on('click',(event)=>{ //add next row for used object where type not select
    $('div[name="'+$(event.target).attr('data-append')+'"]').append(`<div name = "${$(event.target).attr('data-rv')}" class = "row-info">
    <span class="label"></span>
    <input data-rv = "${$(event.target).attr('data-rv')}-main" class ="data" type = "text" placeholder = "Объект/файл">
    <textarea data-rv = "${$(event.target).attr('data-rv')}-info" class = "info" rows="5" placeholder = "Описание"></textarea>
    <a class="next-row" name = "del" data-append = "${$(event.target).attr('data-append')}" href="#">-</a>
    </div>
    `);
    event.preventDefault();
    $('a[name="del"').on('click',(event)=>{
        $(event.target).parent().remove();
     });
});
$('div.row-info[type="info-select"] > .next-row').on('click',(event)=>{//add next row for used object where type select
    let ul ='';
    for (var i = 0 ; i<usedObjects.group.data[$(event.target).attr('data-append').split('-')[0]].list.length; i++){
      ul +=`<li>${usedObjects.group.data[$(event.target).attr('data-append').split('-')[0]].list[i]}</li>\n`;
    }
    $('div[name="'+$(event.target).attr('data-append')+'"]').append(`<div name = "${$(event.target).attr('data-rv')}" class = "row-info">
    <span class="label"></span>
    <div class = "select">
                    <input data-rv = "${$(event.target).attr('data-rv')}-main" type="text" placeholder = "Объект/файл">
                    <a name = "list-show" class = "btn-show"></a>
                    <ul class = "closed">
                    ${ul}
                    </ul>
                </div>
    <textarea data-rv = "${$(event.target).attr('data-rv')}-info" class = "info" rows="5" placeholder = "Описание"></textarea>
    <a class="next-row" name = "del" data-append = "${$(event.target).attr('data-append')}" href="#">-</a>
    </div>
    `);
    event.preventDefault();
    $('a[name="del"').on('click',(event)=>{
        $(event.target).parent().remove();
     });


     function nextRow(event){
        if (event.target.getAttribute('class') == "btn-show"){
        event.target.setAttribute('class','btn-close');
        event.target.nextElementSibling.setAttribute('class','opened');
        } else {
        event.target.setAttribute('class', 'btn-show');
        event.target.nextElementSibling.setAttribute('class','closed');
        }
    };
     document.querySelectorAll('.select a[name="list-show"]').forEach((com)=>{
        com.onclick = nextRow;
     });
    document.querySelectorAll('.select > ul > li').forEach((elem)=>{
    elem.addEventListener('click',(event)=>{
        event.target.parentNode.setAttribute('class','closed');
        event.target.parentNode.previousElementSibling.setAttribute('class','btn-show');
        event.target.parentNode.parentNode.firstElementChild.value = event.target.innerText;
    });
    });
});

};

/*
 mssql.close();
  mssql.connect(dbConfig).then(server=>{
    server.request().query(sql).then(rows=>{
     
    });
   server.on('error',err=>{console.log(err);});
  });

*/


function cleanupInput(){
    clearValues(descriptionPacket);
   clearValues(usedObjects);
}

function generateFile(){
    getValues(descriptionPacket);
    getValues(usedObjects);
   dialog.showSaveDialog((fileName)=>{
     if (fileName === undefined){
         return
     }
     fs.writeFile(fileName.indexOf('.html') != -1 ? fileName : fileName+'.html' ,prepareContent(),(error)=>{ if (error) {console.log(error)}});
   });  
}

function baseUpload(fill){
    getValues(descriptionPacket);
    getValues(usedObjects);
    let sql;
    if (descriptionPacket.group.data['number-candoit'].value.trim() == "" || descriptionPacket.group.data['number-candoit'].value === 'undefined'){
        alert('Отсутствует номер задачи в Access. Введите номер и повторите')
    }else{
        let uploadContent = getDBContent(usedObjects);
       /* if (fill == 'append'){
            sql = `update MyTFS.Задачи set [Задействованные_объекты] = isNull((select [Задействованные_объекты] from MyTFS.Задачи where [Номер] = '${descriptionPacket.group.data['number-candoit'].value}'),' ')+'${uploadContent.replace(/'/g,"'+char(39)+'")}' where [Номер] = '${descriptionPacket.group.data['number-candoit'].value}'`;
        } */
        
            sql = `update MyTFS.Задачи set [Задействованные_объекты] = '${uploadContent.replace(/'/g,"'+char(39)+'")}' where [Номер] = '${descriptionPacket.group.data['number-candoit'].value}'`;
        
        console.log(sql);
        mssql.close();
        mssql.connect(data[DEFAULT_DBSERVER]).then(server=>{
        server.request().query(sql).then(rows=>{
            alert(' Выгрузка завершена! ');
            mssql.close();
        });
       server.on('error',err=>{console.log(err);});
      });
    }
   
    /*
    mssql.close();
       mssql.connect(data[DEFAULT_DBSERVER]).then(()=>{
        return mssql.query(`update MyTFS.Задачи set [Задействованные_объекты] = '${uploadContent}' where [Номер] = '${descriptionPacket.group.data['number-candoit'].value}'`);
    }).then((res)=>{
        alert(' Выгрузка завершена! ');
        mssql.close();
    }).catch((err)=>{
        alert(CONNECTION_ERROR);
        mssql.close();
    });
   
    mssql.on('error',(err)=>{
        console.dir(err);
        mssql.close();
    });*/
    
}

function findFromLabel(label){
    for (let ss in usedObjects.group.data){
        if (label.trim() == usedObjects.group.data[ss].caption){
            return ss;
        }
    }
}

function baseDownload(){
    if ($('[name="number-candoit"]').val().trim() == "" || $('[name="number-candoit"]').val() === 'undefined'){
        alert('Отсутствует номер задачи в Access. Введите номер и повторите')
    } else {
        let sql = `select (select [Ф]+' '+[И]+' '+[О] from MyTFS.Исполнители where TabNo = [Исполнитель]) author, '('+[Департамент_заказчика]+') '+[Постановщик] customer, isNull([Название],'')+' '+isNull([Содержание],'')+' '+isNull([Содержание_задачи],'') [description], [Задействованные_объекты] [objects]  from MyTFS.Задачи  where [Номер] = '${$('[name="number-candoit"]').val()}'`;
    console.log(sql);
        mssql.close();
    mssql.connect(data[DEFAULT_DBSERVER]).then(server=>{
    server.request().query(sql).then(res=>{
        let nw_obj;
        $('[name="del"]').trigger('click');
        clearValues(usedObjects);
        for (var item in res.recordset[0]){
            if (item == 'objects'){
                nw_obj = res.recordset[0][item];
            } else {
              $(`[name="${item}"]`).val(res.recordset[0][item]);  
            }
            
        
        if (nw_obj != null){
        if (nw_obj.trim() != ""){
         console.log(nw_obj.split('\n'));
         let arr_obj = nw_obj.split('\n');
         for (let arr_item of arr_obj){
             if (arr_item != ""){
             let label_item = arr_item.substring(0,arr_item.indexOf('[')-1).trim();
             console.log('label',label_item,'--',findFromLabel(label_item));
             let item_list = arr_item.substr(arr_item.indexOf('[')+1);
             item_list = item_list.substr(0,item_list.length-1);
             item_list = item_list.split(';');
             let list_item_count = item_list.length-1;
             console.log('count-rec',list_item_count);
             for (let i = 0; i<list_item_count-1;i++){
                 $(`[data-rv="${findFromLabel(label_item)}"]`).trigger('click');
             }
             let arr_data =[]
             for (let list_i of item_list){
                 if (list_i.trim() != ''){
                let record = list_i.split(':');
                console.log('main',record[0],'info',record[1]);
                arr_data.push({"main":record[0],"info":record[1]});
               }
             }
             let ln = 0;
            document.querySelectorAll(`[name="${findFromLabel(label_item)}"]`)
                .forEach((elem)=>{
                elem.querySelector(`[data-rv="${findFromLabel(label_item)}-main"`).value = arr_data[ln].main; 
                elem.querySelector(`[data-rv="${findFromLabel(label_item)}-info"`).value = arr_data[ln].info;
                ln++;
                });
            }
         }
        }
    }
}
        alert(' Загрузка завершена! ');
        mssql.close();
    });
   server.on('error',err=>{console.log(err);});
  });

  /*  mssql.connect(data[DEFAULT_DBSERVER]).then(()=>{
        console.log(CONNECTION_SUCCESS)
        return mssql.query (`select (select [Ф]+' '+[И]+' '+[О] from MyTFS.Задачи where TabNo = [Исполнитель]) autor, '('+[Департамент_заказчика]+') '+[Постановщик] customer, isNull([Название],'')+' '+isNull([Содержание],'')+' '+isNull([Содержание_задачи],'') [description] from MyTFS.Задачи where [Номер] = '${$('[name="number-candoit"]').val()}'`)
    }).then((res)=>{
        alert(' Загрузка завершена! ');
        for (var item in res.recordset[0]){
            $(`[name="${item}"]`).val(res.recordset[0][item]);
        }
        mssql.close();
    }).catch((err)=>{
        alert(CONNECTION_ERROR);
        mssql.close();
    });
   
    mssql.on('error',(err)=>{
        console.dir(err);
        mssql.close();
    });*/
    }
   
    
}

function getDBContent(obj){ // generate content for used objects for upload to database
    let gr = obj.group;
    let content = ``;
   for (var ss in gr.data){
       switch (gr.data[ss].type) {
           case "text":
           case "date":
           content +=` ${gr.data[ss].caption}:${gr.data[ss].value};`;
               break;
           case "textarea":
           content += ` ${gr.data[ss].caption}: ${gr.data[ss].value};`; 
               break;
           case "info-select":
           case "info":
           if (gr.data[ss].values.length > 0){
            content +=`${gr.data[ss].caption != ''? gr.data[ss].caption+' [ ' : ''}`;
           for (var ln = 0; ln<gr.data[ss].values.length;ln++){
            content +=`${gr.data[ss].values[ln].main}:${gr.data[ss].values[ln].info};`;  
                }
            content+=' ]\n';
            } else {
                content +='';
            }
               break;
           default:
               break;
       }
   }
   return content;
}

function getValues(obj){ 
    let gr = obj.group;
    for (var ss in gr.data){
        switch (gr.data[ss].type) {
            case "text":
            case "date":
            gr.data[ss].value = $(`input[data-rv="${ss}"][name = "${ss}"]`).val();
                break;
            case "textarea":
            gr.data[ss].value = $(`textarea[data-rv="${ss}"][name = "${ss}"]`).val();
                break;
            case "info":
            let rv;
            gr.data[ss].values = [];
            document.querySelectorAll(`[name="${ss}"]`)
            .forEach((elem)=>{
                if (elem.querySelector(`[data-rv="${ss}-main"`).value.trim() != "" && elem.querySelector(`[data-rv="${ss}-info"`).value != ""){
                rv = {"main":elem.querySelector(`[data-rv="${ss}-main"`).value, "info":elem.querySelector(`[data-rv="${ss}-info"`).value};
                gr.data[ss].values.push(rv);
               }
            });
                break;
             case "info-select":
             let rvl;
            gr.data[ss].values = [];
            document.querySelectorAll(`[name="${ss}"]`)
            .forEach((elem)=>{
                if (elem.querySelector(`[data-rv="${ss}-main"`).value.trim() != "" && elem.querySelector(`[data-rv="${ss}-info"`).value != ""){
                rvl = {"main":elem.querySelector(`[data-rv="${ss}-main"`).value, "info":elem.querySelector(`[data-rv="${ss}-info"`).value};
                gr.data[ss].values.push(rvl);
                }
            });
                break;
            default:
                break;
        }
    }
};

function clearValues(obj){
    let gr = obj.group;
    for (var ss in gr.data){
        switch (gr.data[ss].type) {
            case "text":
            case "date":
            $(`input[data-rv="${ss}"][name = "${ss}"]`).val('');
                break;
            case "textarea":
            $(`textarea[data-rv="${ss}"][name = "${ss}"]`).val('');
                break;
            case "info":
            document.querySelectorAll(`[name="${ss}"]`)
            .forEach((elem)=>{
                elem.querySelector(`[data-rv="${ss}-main"`).value = "";
                elem.querySelector(`[data-rv="${ss}-info"`).value = "";
             
            });
                break;
             case "info-select":
             let rvl;
            gr.data[ss].values = [];
            document.querySelectorAll(`[name="${ss}"]`)
            .forEach((elem)=>{
                elem.querySelector(`[data-rv="${ss}-main"`).value = "";
                elem.querySelector(`[data-rv="${ss}-info"`).value = "";
            });
                break;
            default:
                break;
        }
    }
};

function drawInterfaceData (obj){ // generate html path for patch file
    let gr = obj.group;
    let html = ``;
    
    if (gr.name == "used-objects"){
        html += `<table class="expander-i" name = "${gr.name}">`;
        html += `<thead> <tr> <th colspan = "3" class = "group-name">${gr.caption}</th> </tr> </thead>`;
    } else {
        html += `<table class="expander" name = "${gr.name}">`;
        html += `<thead> <tr> <th colspan = "2" class = "group-name">${gr.caption}</th> </tr> </thead> <tbody>`;
    }
    
   for (var ss in gr.data){
       switch (gr.data[ss].type) {
           case "text":
           case "date":
           html +=`
                <tr class = "row">
                <td>${gr.data[ss].caption}</td>
                <td>${gr.data[ss].value}</td>
                </td>
                `;
               break;
           case "textarea":
           html += `
                <tr class = "row">
                <td>${gr.data[ss].caption}</td>
                <td>${gr.data[ss].value}</td>
                </td>
                `; 
               break;
           case "info-select":
           case "info":
           if (gr.data[ss].values.length > 0){
           
           for (var ln = 0; ln<gr.data[ss].values.length;ln++){
            html +=`
                    
                    <tr name = "${ss}" class = "row-info" type = "${gr.data[ss].type}">
                    <td class="label">${ln == 0 ? gr.data[ss].caption : ''}</td>
                    <td>${gr.data[ss].values[ln].main}</td>
                    <td>${gr.data[ss].values[ln].info}</td>
                    </tr>
                    `;  
                }
            } else {
                html +='';
            }
               break;
           default:
               break;
       }
   }
   return html+'<tbody> </table>';
};

function prepareContent(){ // generate content of patch file

    let resultContent = `
    <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
        <style>
        body{
            display:grid;
            grid-template-columns: 25% 50% 25%;
            grid-template-rows: 100%;
            grid-template-areas: ". main .";
            background:#ffffff;
        }             
        table{
            margin-bottom: 10px;
        }
        table {
            border-collapse: collapse;
            width: 100%;
        }
        thead > tr > th {
             background: #244388;
             color:#fff;
        }
        table, th, td {
            border: 1px solid rgb(48, 48, 48);
        }
        tr > td:nth-child(1){
            width:35%;
        }
        .expander-i tr > td:nth-child(1){
            width:15%;
        }
        .expander-i tr > td:nth-child(2){
            width:30%;
        }
        tr:nth-child(even){
            background: #f1f1f1;
        }
        th{
            padding:10px;
        }
        td{
            padding:5px;
        }
        .container{
            display:block;
            grid-area: main;
            width:100%;
            box-sizing: border-box;
            margin-top:10px;
            color:#000000;
        }
        ::-webkit-scrollbar{
          width: 5px;
          background:transparent;
        }
        
        ::-webkit-scrollbar-thumb{
            background: #1290e3;
        }
        </style>   
            <title>Patch Document</title>
        </head>
        <body>
            <div class="container">
            ${drawInterfaceData(descriptionPacket)}
            ${drawInterfaceData(usedObjects)}
            </div>
        </body>
        </html>

    `;
    return resultContent;
};