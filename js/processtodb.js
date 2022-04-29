import convertxlsx from './xlsxtoarray.js';
import mysql from 'mysql';
import fetch from 'node-fetch';
import { DB_USERNAME, DB_PASSWORD } from '../dbconfig.js';

var connection = mysql.createConnection({
    host: 'localhost',
    user: DB_USERNAME,
    password: DB_PASSWORD,
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