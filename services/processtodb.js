import convertxlsx from '../static/js/xlsxtoarray.js';
import mysql from 'mysql';
import fetch from 'node-fetch';
import { DB_USERNAME, DB_PASSWORD } from '../dbconfig.js';
import { slaveInsert, mainInsert } from './mysql/functions.js';

//database configuration
var con = mysql.createConnection({
    host: 'localhost',
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: 'organisasjoner'
});

//convert xlsx file to readable array of Org numbers
var liste = convertxlsx("organisasjonsnumre.xlsx");

//fetch all data from api for list
async function forFetch(orgliste) {
    let batch = [];
    var requests = 0;
    console.time("time");
    for (let orgnr of orgliste) {
        requests = 0;
        var data = fetch(`https://data.brreg.no/enhetsregisteret/api/enheter/${orgnr}`)
            .then(async res => {
                if (res.ok) return res.json();
                // check for error response
                if (!res.ok) {
                    // get error message from body or default to response status
                    const error = res.status;
                    return Promise.reject(error);
                }
            })
            .then(res => {
                requests++;
                // console.log("getting data...", requests);
                return Promise.resolve(res);
            })
            .catch(error => {
                requests++;
                // console.error('There was an error!', requests);
            });
        batch.push(data);
    }

    let batchResults = await Promise.all(batch);

    let undefinedResult = batchResults.filter(element => element == undefined);
    let result = batchResults.filter(element => element != undefined);
    console.log("undefinedResult", undefinedResult.length);
    console.log("result", result.length);
    return result;
}


var firstBatch = await forFetch(liste.splice(0, liste.length / 2));
var secondBatch = await forFetch(liste.splice(liste.length / 2, liste.length));

var result = [...firstBatch, ...secondBatch];
console.log(result.length);

//connect and execute querys
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

const main = (data) => {
    // console.log("Inserting slave data...");
    // for (data in result) {
    //     slaveInsert(result[data]);
    // }
    // console.log("Inserting slave data complete.");
    console.log("Inserting main data...");
    for (data in result) {
        mainInsert(result[data]);
    }
    console.log("Inserting main data complete.");


}

main(result);