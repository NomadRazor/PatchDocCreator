const $ = require('jquery');
const fs = require('fs');
const mysql = require('mysql');
const mssql = require('mssql');
const preset = require('./settingspreset.js');




const CONNECTION_SUCCESS = "Connection successfully established!";
const CONNECTION_ERROR = "Connection not established";
const settingsFileEnc = './database_settings.enc';

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

let data = fs.existsSync(settingsFileEnc) ? JSON.parse(preset.DEncryptFile(settingsFileEnc,'r')) : setting_template; 

function getAndSaveData(ev){
    let need_save = false;
    for (var sp in data[currentPreset]){
        if (typeof(data[currentPreset][sp])==='object'){
            for (var svr in data[currentPreset][sp]){
                if ($(`input[name="${sp}-${svr}"]`).val() != data[currentPreset][sp][svr]){
                    data[currentPreset][sp][svr] = $(`input[name="${sp}-${svr}"]`).val();
                    need_save = true;
                }
            }
        } else {
        if ($(`input[name="${sp}"]`).val() != data[currentPreset][sp]){
            data[currentPreset][sp] = $(`input[name="${sp}"]`).val();
            need_save = true;
        }
    }
    }
    if(need_save){
        /*fs.writeFileSync(settingsFile,JSON.stringify(data));*/
        preset.DEncryptFile(settingsFileEnc,'w',JSON.stringify(data));
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
                        console.error(CONNECTION_ERROR+' '+ err.stack);
                        return;
                        }
                        setStatus(CONNECTION_SUCCESS+' Connected as id ' + connection.threadId);
                    });
                    connection.query('select 1',(err,res,fields)=>{
                        if (err) {
                            console.dir(err);
                        };
                    });
                    connection.end();
                  break;
              case "mssql":
                    mssql.connect(data[currentPreset],(err) => {
                        new mssql.Request().query('select 1 as number',(err,res)=>{
                            if (!err){
                            setStatus(CONNECTION_SUCCESS)
                            console.dir(res);
                            } else {
                                setStatus(CONNECTION_ERROR);
                                console.dir(CONNECTION_ERROR,err.stack);
                            }
                        });
                    });
                    mssql.close();
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
};

function showPreset(el){
    $('div[name="rv-data"').remove();
    let cur = el.options[el.selectedIndex].value;
    var r;
    if (cur != '-'){
    currentPreset = cur;
    let rv_html=``;
    for(var sm in data[cur]){
        if (typeof(data[cur][sm])=== 'object'){
            for(var svr in data[cur][sm]){
                rv_html+=`<div class="row"><span class="label">${sm}-${svr}</span><input name = "${sm}-${svr}" type="text" class="info" value="${data[cur][sm][svr]}"></div>`;
            }
        } else {
            rv_html+=`<div class="row"><span class="label">${sm}</span><input name = "${sm}" type="${r = sm == "password"?'password':'text'}" class="info" value="${data[cur][sm]}"></div>`;  
        }
        
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
addButtons(headerButtons);
