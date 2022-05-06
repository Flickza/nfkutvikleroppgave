import fetch from 'node-fetch';
import convertxlsx from '../static/js/xlsxtoarray.js';
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
async function syncFetch(response) {
    for (let i = 0; i < orgliste.length; i++) {
        const value = await get(`https://data.brreg.no/enhetsregisteret/api/enheter/${orgliste[i]}`);
        console.log(i);
        array.push(value);

    }
    console.log(array.length)
    // convert JSON object to string
    var check2 = array.filter(e => e != undefined);
    const data = JSON.stringify(check2);

    if (response == "write") {
        // write JSON string to a file
        fs.writeFile('syncData.json', data, (err) => {
            if (err) {
                throw err;
            }
            console.log("JSON data is saved.");
        });
    } else if (response == "get") {
        return data;
    }
}

export { syncFetch };
