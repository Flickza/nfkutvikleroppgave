import fetch from 'node-fetch';
import convertxlsx from './static/js/xlsxtoarray.js';
import fs from 'fs';

let orgliste = convertxlsx("organisasjonsnumre.xlsx");


let array = new Array;
function get(url) {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(res => {
                if (res.ok) return res.json();
                else return;
            })
            .then(res => {
                resolve(res)
            }
            )
            .catch(err => { reject(err) })
    });
}
async function result() {
    for (let i = 0; i < orgliste.length; i++) {
        const value = await get(`https://data.brreg.no/enhetsregisteret/api/enheter/${orgliste[i]}`);
        console.log(i);
        array.push(value);

    }
    console.log(array.length)
    // convert JSON object to string
    const data = JSON.stringify(array);

    // write JSON string to a file
    fs.writeFile('user.json', data, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });
}

// result()


fs.readFile('C:/Users/Adel/nfkutvikleroppgave/user.json', 'utf8' , (err, data) => {
    if (err) {
      console.error(err);
      return
    }
    var array = JSON.parse(data);
    var check1 = array.filter(e => e != null);
    var check2 = check1.filter(e => e != undefined);
    console.log(check2.filter(e => e.organisasjonsnummer > 1).length);
});