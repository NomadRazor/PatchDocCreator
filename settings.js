let $ = require('jquery');
var fs = require('fs');
let mysql = require('mysql');
let mssql = require('mssql');


let data = JSON.parse(fs.readFileSync('./database_settings.json','utf8'));
let currentPreset;
let headerButtons = {
    "testConnection":{
          "label":"Тест соединения",
          "click":"testConnection(this)",
          "parent":'header'
    }
};

function testConnection(){
      if (currentPreset != ''){
          switch (currentPreset) {
              case "mysql":
                    var connection = mysql.createConnection(data[currentPreset]);
                    connection.connect((err)=>{
                        if (err) {
                        console.error('error connecting: ' + err.stack);
                        return;
                        }
                        console.log('connected as id ' + connection.threadId);
                        alert('connected as id ' + connection.threadId);
                    });
                    connection.query('select 1',(err,res,fields)=>{
                        if (err) {
                            console.dir(err);
                        };
                    });
                    connection.end();
                  break;
              case "mssql":
                    mssql.connect(data[currentPreset]).then(() => {
                        return mssql.query`select 1`
                        }).then(result => {
                            console.dir(result)
                        }).catch(err => {
                            console.log(err);
                        })
                        
                        mssql.on('error', err => {
                            // ... error handler
                        })
              break;
              default:
                  break;
          }
         
      }
}

/*function ThunderSelect(list){
     this.prep_list = (()=>{
        let ul ='';
        for (var i = 0 ; i<list.length; i++){
          ul +=`<li onclick="this.parentNode.setAttribute('class','closed');this.parentNode.previousElementSibling.setAttribute('class','btn-show');
          this.parentNode.parentNode.firstElementChild.value = event.target.innerText;">${list[i]}</li>\n`;
        }
        return ul;
     })();
     this.render = ` 
     <div class = "select">
        <input type="text" placeholder = "Объект/файл">
        <a name = "list-show" class = "btn-show" onclick = "openList(this)"></a>
            <ul class = "closed">
            ${this.prep_list}
            </ul>
     </div>`;    
    
    return this.render;
}

$('.container').append(ThunderSelect(((obj)=>{let arr = []; for(var x in obj){arr.push(x)}; return arr})(data)));

function openList(event){
    if (event.getAttribute('class') == "btn-show"){
    event.setAttribute('class','btn-close');
    event.nextElementSibling.setAttribute('class','opened');
    } else {
    event.setAttribute('class', 'btn-show');
    event.nextElementSibling.setAttribute('class','closed');
    }
};*/

function getList(obj){
    let html = `<div name = "header"><span class = "lbl">Preset </span><select onchange = "showPreset(this)"><option value="-">-</option>`;
    for(var ss in obj){
        html += `<option value=${ss}>${ss}</option>`;
    }
    html +=`</select></div>`;
    $('.container').append(html);
};

function showPreset(el){
    $('div[name="rv-data"').remove();
    let cur = el.options[el.selectedIndex].value;
    if (cur != '-'){
    currentPreset = cur;
    let rv_html=``;
    for(var sm in data[cur]){
        rv_html+=`<div class="row"><span class="label">${sm}</span><input name = "${sm}" type="text" class="info" value="${data[cur][sm]}"></div>`;
    }
    $('.container').append(`<div name = "rv-data">${rv_html}</div>`); 
    }
};

function addButtons(obj){
    let html = ``;
    for (var hb in obj){
        html =`<button class = "btn connect" name = ${hb} onclick ="${obj[hb].click}">${obj[hb].label}</button>`;
        $(`[name = "${obj[hb].parent}"]`).append(html);
    }
}

getList(data);

addButtons(headerButtons);
