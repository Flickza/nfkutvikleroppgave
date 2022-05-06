import convertxlsx from '../static/js/xlsxtoarray.js';
import mysql from 'mysql';
import { DB_USERNAME, DB_PASSWORD } from '../dbconfig.js';
import { asyncFetch } from './asyncFetch.js';
import { slaveInsert, mainInsert } from './mysql/functions.js';
import { syncFetch } from './syncFetch.js';
import fs from 'fs';
//database configuration
var con = mysql.createConnection({
    host: 'localhost',
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: 'organisasjoner'
});

// function readJsonFile(file) {
//     let bufferData = fs.readFileSync(file)
//     let stData = bufferData.toString()
//     let data = JSON.parse(stData)
//     return data
// }


//data from file
// var syncDataFromFile = readJsonFile("./asyncData.json")
// var data = JSON.parse(JSON.stringify(syncDataFromFile));


// convert xlsx file to readable array of Org numbers
var liste = convertxlsx("organisasjonsnumre.xlsx");
//get async data
var data = (await asyncFetch(liste)).filter(e => e.organisasjonsnummer != undefined);


//connect and execute querys
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

const SLAVE = async (jsonData) => {
    console.log("Inserting slave data...");
    for (var data in jsonData) {
        slaveInsert(jsonData[data]);
    }
    console.log("Inserting slave data complete.");
}

const MAIN = async (jsonData) => {
    console.log("Inserting slave data...");
    for (var data in jsonData) {
        mainInsert(jsonData[data]);
    }
    console.log("Inserting slave data complete.");
}
await SLAVE(data);
await MAIN(data);