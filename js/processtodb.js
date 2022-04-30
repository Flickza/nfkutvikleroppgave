import convertxlsx from './xlsxtoarray.js';
import mysql from 'mysql';
import fetch from 'node-fetch';
import { DB_USERNAME, DB_PASSWORD } from '../dbconfig.js';

var orgliste = convertxlsx("organisasjonsnumre.xlsx");
console.log(orgliste);

//fetch first organisation in list
fetch(`https://data.brreg.no/enhetsregisteret/api/enheter/${orgliste[0]}`)
    .then(response => response.json())
    .then(data => console.log(JSON.stringify(data)));

//database configuration
var connection = mysql.createConnection({
    host: 'localhost',
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: 'organisasjoner'
});

//connect to database
connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "INSERT INTO customers (name, address) VALUES ('Company Inc', 'Highway 37')";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
});


