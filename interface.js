let descriptionPacket = {
    "parent":"container",
    "group":{
        "name":"package-description",
        "caption":"Описание пакета",
        "data":{
            "number-candoit":{
                "type":"text",
                "caption":"Номер задачи в Access",
                "value":""
            },
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
            },
            "setup-plan":{
                "type":"textarea",
                "caption":"План установки",
                "value":""
            },
            "return-plan":{
                "type":"textarea",
                "caption":"План отката",
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
            "list":[],
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

let applicationDimentions = {
    "D08FUNC":['D_BUnit',
    'D_Measures',
    'D_Period',
    'D_Scenario',
    'D_Version',
    'D_Year',
    'UC00 ~ Level',
    'UC01 ~ Total',
    'UC02 ~ IBUnit',
    'UC03 ~ CFO','UC04 ~ iCFO',
    'UC05 ~ Accounts',
    'UC06 ~ Goods','UC07',
    'UC08 ~ iBUnit',
    'UC09','UC10 ~ BUnitDivision',
    'UC11','UC12'],
    "D09CONS":['D_BUnit',
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
    "D10SGOOD":['D_Account',
    'D_BUnit',
    'D_Period',
    'D_Scenario',
    'D_Version',
    'D_Year',
    'UC00 ~ Level',
    'UC01 ~ Goods',
    'UC02 ~ Assortment',
    'UC03 ~ Measure'],
    "D11FUNC":['D_Account',
    'D_BUnit',
    'D_Period',
    'D_Scenario',
    'D_Version',
    'D_Year',
    'UC00 ~ Level',
    'UC01 ~ BudgetForms',
    'UC02 ~ Status',
    'UC03 ~ Measure'],
    "D12CAPEX":['D_Account',
    'D_BUnit',
    'D_Period',
    'D_Scenario',
    'D_Version',
    'D_Year',
    'UC00 ~ Level',
    'UC01 ~ Projects',
    'UC02 ~ Measure',
    'UC03 ~ CFO',
    'UC04 ~ Status',
    'UC06 ~ BUnitAttributes'],
    "D14BCKMC":['D_Account',
    'D_Measures',
    'D_Period',
    'D_Scenario',
    'D_Version',
    'D_Year',
    'UC00 ~ Level',
    'UC01 ~ Goods',
    'UC02 ~ VTM',
    'UC03 ~ Supplier','UC04 ~ ServicePeriod',
    'UC05 ~ Days']
}

module.exports.usedObjects = usedObjects;
module.exports.descriptionPacket = descriptionPacket;
module.exports.applicationDimentions = applicationDimentions;

  