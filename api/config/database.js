var mysql = require('mysql');
var credential={};

credential = {
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASS,
    database:process.env.DATABASE_NAME,
    multipleStatements:true,
    dateStrings:'date'
}

var database = mysql.createPool(credential);

module.exports = database;