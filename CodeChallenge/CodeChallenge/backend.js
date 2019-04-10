var mysql = require('mysql');
var propReader = require('properties-reader');
var properties = propReader('./properties.ini');

//var db_name = "4413_project_DB";

var exports = module.exports = {};

exports.connect = function () {
    return new Promise(function (resolve, reject) {

        var host = properties.get('db.host').toString();
        var user = properties.get('db.user').toString();
        var pass = properties.get('db.pass').toString();
        var db = properties.get('db.name').toString();

        console.log(host + user + pass + db);
        var con = mysql.createConnection({
            host: host,
            user: user,
            password: pass
        });

        con.connect(function (err) {
            if (err) reject(err);
            console.log("Connected!");
            con.query("use " + db, function (err, result) {
                if (err) reject(err);
                //console.log("Using: " + db_name);
                resolve("Using: " + db);
            });
        });
    });
}

exports.addHash = function (hash) {

}

exports.retrieveAllHashes = function () {

}