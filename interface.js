let descriptionPacket = {
    "parent":"container",
    "group":{
        "name":"package-description",
        "caption":"Описание пакета",
        "data":{
            "author":{
                "type":"text",
                "caption":"Автор",
                "value":""
            },
            "patch-number":{
                "type":"text",
                "caption":"Патч(УРИС)",
                "value":""
            },
            "date-create":{
                "type":"text",
                "caption":"Дата",
                "value":""
            },
            "description":{
                "type":"textarea",
                "caption":"Краткое описание ошибки",
                "value":""
            },
            "customer":{
                "type":"text",
                "caption":"Заказчик разработки",
                "value":""
            }
        }
    }
    
}; // interface settings
let usedObjects = {
  "parent":"container",
  "group":{
    "name":"used-objects",
    "caption":"Список объектов/файлов в пакете",
    "data":{
        "patch-files":{
            "type":"info",
            "caption":"Файлы",
            "values":[]
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
                    'UC12 ~ LegalEntity'],
            "values":[]
        },
        "tasks":{
            "type":"info",
            "caption":"Задачи",
            "values":[]
        },
        "menus":{
            "type":"info",
            "caption":"Пункты меню",
            "values":[]
        },
        "sql-scripts":{
            "type":"info",
            "caption":"SQL скрипты",
            "values":[]
        },
        "bat-scripts":{
            "type":"info",
            "caption":"Bat скрипты",
            "values":[]
        }
    }
  }
};

module.exports.usedObjects = usedObjects;
module.exports.descriptionPacket = descriptionPacket;

  