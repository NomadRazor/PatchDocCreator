let $ = require('jquery');
var fs = require('fs');
let mysql = require('mysql');
let mssql = require('mssql');
const settingsFile = './database_settings.json';

let data = JSON.parse(fs.readFileSync(settingsFile,'utf8'));
let currentPreset;
let headerButtons = {
    "testConnection":{
          "label":"Тест соединения",
          "click":"testConnection(this)",
          "parent":'header',
          "class":'connect'
    },
    "saveData":{
        "label":"Сохранить изменения",
        "click":"getAndSaveData(this)",
        "parent":"header",
        "class":"save"
    }
};

function getAndSaveData(ev){
    let need_save = false;
    for (var sp in data[currentPreset]){
        if ($(`input[name="${sp}"]`).val() != data[currentPreset][sp]){
            data[currentPreset][sp] = $(`input[name="${sp}"]`).val();
            need_save = true;
        }
    }
    if(need_save){
        fs.writeFileSync(settingsFile,JSON.stringify(data));
        setStatus('Settings succesfully saved!');
    } else {
        setStatus('Data not changed!');
    }
}

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
                        setStatus('Connection succesfull. Connected as id ' + connection.threadId);
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
                            setStatus('Connection error!');
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

function getList(obj){
    let html = `<div id="hd" name = "header"><span class = "lbl">Preset </span><select onchange = "showPreset(this)"><option value="-">-</option>`;
    for(var ss in obj){
        html += `<option value=${ss}>${ss}</option>`;
    }
    html +=`</select></div>`;
    $('.container').append(html);
    console.log('after render',obj);
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
        html =`<button class = "btn ${obj[hb].class}" name = ${hb} onclick ="${obj[hb].click}">${obj[hb].label}</button>`;
        $(`[name = "${obj[hb].parent}"]`).append(html);
    }
    $('[name="header"]').append('<span id = "connection-status"></span>');
}

function setStatus(msg){
     $('#connection-status').text(msg);
}

getList(data);
console.log('after render 1',data);
addButtons(headerButtons);
