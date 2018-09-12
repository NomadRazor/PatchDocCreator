// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
let $ = require('jquery');
const descriptionPacket = {
        "parent":"container",
        "group":{
            "name":"package-description",
            "caption":"Описание пакета",
            "data":{
                "author":{
                    "type":"text",
                    "caption":"Автор"
                },
                "patch-number":{
                    "type":"text",
                    "caption":"Патч(УРИС)"
                },
                "date-create":{
                    "type":"text",
                    "caption":"Дата"
                },
                "description":{
                    "type":"textarea",
                    "caption":"Краткое описание ошибки"
                },
                "customer":{
                    "type":"text",
                    "caption":"Заказчик разработки"
                }
            }
        }
        
}; // interface settings
const usedObjects = {
      "parent":"container",
      "group":{
        "name":"used-objects",
        "caption":"Список объектов/файлов в пакете",
        "data":{
            "patch-files":{
                "type":"info",
                "caption":"Файлы"
            },
            "dimentions":{
                "type":"info-select",
                "caption":"Измерения",
                "list":['D_BUnit',
                        'D_Measures',
                        'D_Period',
                        'D_Scenario',
                        'D_Version',
                        'D_Year',
                        'UC00 ~ Level',
                        'UC01 ~ Projects',
                        'UC02 ~ BudgetForms',
                        'UC03','UC04',
                        'UC05 ~ Accounts',
                        'UC06','UC07',
                        'UC08 ~ iBUnit',
                        'UC09','UC10 ~ BUnitDivision',
                        'UC11 ~ Status',
                        'UC12 ~ LegalEntity']
            },
            "tasks":{
                "type":"info",
                "caption":"Задачи"
            },
            "menus":{
                "type":"info",
                "caption":"Пункты меню"
            },
            "sql-scripts":{
                "type":"info",
                "caption":"SQL скрипты"
                
            },
            "bat-scripts":{
                "type":"info",
                "caption":"Bat скрипты"
            }
        }
      }
};

function drawInterface (obj){
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
                <input name = "${ss}" type = "${gr.data[ss].type}" placeholder = "${gr.data[ss].caption}">
                </div>
                `);
               break;
           case "textarea":
           $(groupParent).append(`
                <div class = "row">
                <span>${gr.data[ss].caption}</span>
                <textarea name = "${ss}" rows = "10" cols = "60" placeholder = "${gr.data[ss].caption}"></textarea>
                </div>
                `); 
               break;
           case "info":
           $(groupParent).append(`
                <div name = "${ss}-container">
                <div name = "${ss}" class = "row-info" type = "${gr.data[ss].type}">
                <span class="label">${gr.data[ss].caption}</span>
                <input class ="data" type = "text" placeholder = "Объект/файл">
                <textarea class = "info" rows="5" placeholder = "Описание"></textarea>
                <a class="next-row" data-append = "${ss}-container" href="#">+</a>
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
                    <input type="text" placeholder = "Объект/файл">
                    <a name = "list-show" class = "btn-show"></a>
                    <ul class = "closed">
                    ${ul}
                    </ul>
                </div>
                <textarea class = "info" rows="5" placeholder = "Описание"></textarea>
                <a class="next-row" data-append = "${ss}-container" href="#">+</a>
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

$('div.row-info[type = "info"] > .next-row').on('click',(event)=>{
    $('div[name="'+$(event.target).attr('data-append')+'"]').append(`<div class = "row-info">
    <span class="label"></span>
    <input class ="data" type = "text" placeholder = "Объект/файл">
    <textarea class = "info" rows="5" placeholder = "Описание"></textarea>
    <a class="next-row" name = "del" data-append = "${$(event.target).attr('data-append')}" href="#">-</a>
    </div>
    `);
    event.preventDefault();
    $('a[name="del"').on('click',(event)=>{
        $(event.target).parent().remove();
     });
});
$('div.row-info[type="info-select"] > .next-row').on('click',(event)=>{
    console.log('return');
    let ul ='';
    for (var i = 0 ; i<usedObjects.group.data[$(event.target).attr('data-append').split('-')[0]].list.length; i++){
      ul +=`<li>${usedObjects.group.data[$(event.target).attr('data-append').split('-')[0]].list[i]}</li>\n`;
    }
    $('div[name="'+$(event.target).attr('data-append')+'"]').append(`<div class = "row-info">
    <span class="label"></span>
    <div class = "select">
                    <input type="text" placeholder = "Объект/файл">
                    <a name = "list-show" class = "btn-show"></a>
                    <ul class = "closed">
                    ${ul}
                    </ul>
                </div>
    <textarea class = "info" rows="5" placeholder = "Описание"></textarea>
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

$(`.container`).append('<div class = "center-row"><button class = "generate-btn">Сгенерировать файл</button></div>');
$('.generate-btn').on('click',()=>{
   console.log($('.container').html());
});

/*function asset(){
    let objectStringify = function (obj){
        let str = '';
        for(let ss in obj){
            
            if (typeof(obj[ss]) == "object"){
               str += ss + '<br>' + objectStringify(obj[ss]);
            } else {
                str += `${ss} - ${obj[ss]} <br>`;
            }
        }
        return str;
    };
    let settingsData = objectStringify(IS);
    console.log('settings',settingsData);
    $('.container').html(settingsData);
}
asset();*/



