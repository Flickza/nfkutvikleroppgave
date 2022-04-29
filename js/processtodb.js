import convertxlsx from './xlsxtoarray.js';
import mysql from 'mysql';
import fetch from 'node-fetch';

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'main',
    password: 'adminadmin',
    database: 'organisasjoner'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Server!');
});

var orgliste = convertxlsx("organisasjonsnumre.xlsx");
console.log(orgliste);

fetch("https://data.brreg.no/enhetsregisteret/api/enheter/810098252")
    .then(response => response.json())
    .then(data => console.log(JSON.stringify(data)));