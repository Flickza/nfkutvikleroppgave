import convertxlsx from '../static/js/xlsxtoarray.js';
import mysql from 'mysql';
import { DB_USERNAME, DB_PASSWORD } from '../dbconfig.js';
import {asyncFetch} from './asyncFetch.js';
import { slaveInsert, mainInsert } from './mysql/functions.js';
import fs from 'fs';

function readJsonFile(file) {
    let bufferData = fs.readFileSync(file)
    let stData = bufferData.toString()
    let data = JSON.parse(stData)
    return data
}



//database configuration
var con = mysql.createConnection({
    host: 'localhost',
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: 'organisasjoner'
});

var syncDataFromFile = readJsonFile("./data.json")

// convert xlsx file to readable array of Org numbers
var liste = convertxlsx("organisasjonsnumre.xlsx");

//make a request for half the org numbers
var firstBatch = await asyncFetch(liste.splice(0, liste.length / 2));
//make a request for the second half of numbers
var secondBatch = await asyncFetch(liste.splice(liste.length / 2, liste.length));

//merge the two batches
var result = [...firstBatch, ...secondBatch];

//console.log the length of the batch array
console.log(result.length);


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
await SLAVE(syncDataFromFile);
await MAIN(syncDataFromFile);