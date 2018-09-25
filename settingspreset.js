let crypto = require('crypto');

let setting_template = {"mysql":{"host":"","user":"","port":"","password":"","database":""},"mssql":{"server":"","user":"","password":"","options":{"encrypt":"","database":""}}};

function DEncryptFile(file,flag,content){
    switch (flag){
        case "w":
            var mykey = crypto.createCipher('aes192', 'reveal4x3m');
            var mystr = mykey.update(content, 'utf8', 'hex')
            mystr += mykey.final('hex');
            fs.writeFileSync(file,mystr,{flag:'w+'});
        break;
        case "r":
            var mykey = crypto.createDecipher('aes192', 'reveal4x3m');
            var mystr = mykey.update(fs.readFileSync(file,'utf8'), 'hex', 'utf8')
            mystr += mykey.final('utf8');
            return mystr;
        break;
    }
};

module.exports.setting_template = setting_template;
module.exports.DEncryptFile = DEncryptFile;
