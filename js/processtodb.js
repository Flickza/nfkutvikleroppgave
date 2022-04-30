import convertxlsx from './xlsxtoarray.js';
import mysql from 'mysql';
import fetch from 'node-fetch';
import { DB_USERNAME, DB_PASSWORD } from '../dbconfig.js';

//database configuration
var con = mysql.createConnection({
    host: 'localhost',
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: 'organisasjoner'
});

//convert xlsx file to readable array of Org numbers
var orgliste = convertxlsx("organisasjonsnumre.xlsx");

//connect and execute querys
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});


for (let i = 0; i < orgliste.length; i++) {
    fetch(`https://data.brreg.no/enhetsregisteret/api/enheter/${orgliste[i]}`)
        .then(response => {
            if (response.ok) return response.json();
            if (!response.ok) return response.status;
        })
        .then(async orgData => {
            if (orgData == undefined) console.log(i);
            if (orgData != undefined) await main(orgData);
        });
}

//function to insert data
var main = async (orgData) => {
    await orgData;
    var config = {
        "kommune_id": 0,
        "naering_id": 0,
        "instsektor_id": 0,
        "orgform_id": 0,
        "land_id": 0,
        "forretning_poststed_id": 0,
        "forretningsadresse_id": 0,
    };
    kommune_select_insert(
        orgData.forretningsadresse.kommunenummer,
        orgData.forretningsadresse.kommune,
        function (result) {
            config.kommune_id = result;

            //naeringskode
            koder("naeringskode",
                orgData.naeringskode1.kode,
                orgData.naeringskode1.beskrivelse,
                function (result) {
                    config.naering_id = result;

                    //institusjonellSektorkode
                    koder("instsektorkode",
                        orgData.institusjonellSektorkode.kode,
                        orgData.institusjonellSektorkode.beskrivelse,
                        function (result) {
                            config.instsektor_id = result;
                            //organisasjonsform
                            koder("orgform",
                                orgData.organisasjonsform.kode,
                                orgData.organisasjonsform.beskrivelse,
                                function (result) {

                                    config.orgform_id = result;
                                    //land
                                    land(orgData.forretningsadresse.landkode,
                                        orgData.forretningsadresse.land,
                                        function (result) {
                                            config.land_id = result;
                                            //forretnings adresse poststed
                                            poststed(orgData.forretningsadresse.postnummer,
                                                orgData.forretningsadresse.poststed,
                                                function (result) {
                                                    config.forretning_poststed_id = result;
                                                    //forretningsadresse
                                                    adresser("forretningsadresse",
                                                        orgData.forretningsadresse.adresse[0],
                                                        config.forretning_poststed_id,
                                                        config.land_id,
                                                        function (result) {
                                                            config.forretningsadresse_id = result;
                                                            //organisasjon
                                                            org(
                                                                orgData.organisasjonsnummer,
                                                                orgData.navn,
                                                                orgData.antallAnsatte,
                                                                config.orgform_id,
                                                                config.instsektor_id,
                                                                config.naering_id,
                                                                orgData.stiftelsesdato,
                                                                orgData.registreringsdatoEnhetsregisteret,
                                                                orgData.sisteInnsendteAarsregnskap,
                                                                orgData.konkurs,
                                                                orgData.underAvvikling,
                                                                orgData.underTvangsavviklingEllerTvangsopplosning,
                                                                orgData.registrertIFrivillighetsregisteret,
                                                                orgData.registrertIStiftelsesregisteret,
                                                                orgData.registrertIForetaksregisteret,
                                                                config.forretningsadresse_id,
                                                                config.kommune_id,
                                                                function (result) {
                                                                    console.log(result);
                                                                }
                                                            );
                                                        });
                                                });
                                        });
                                });
                        });
                });
        });
};

var kommune_select_insert = (kommune_nr, kommune_navn, callback) => {
    //execute main query
    con.query(`SELECT id FROM kommune WHERE kommunenr='${kommune_nr}' AND kommune_navn='${kommune_navn}'`, function (err, result) {
        //throw error if error
        if (err) throw err;

        //if row was not found | id not selected
        //insert the row and return the id
        if (result.length == 0) {
            con.query(`INSERT INTO kommune (kommunenr, kommune_navn) VALUES ('${kommune_nr}', '${kommune_navn}')`, function (err, result) {
                //throw error if error
                if (err) throw err;

                console.log("1 record inserted. Kommune_id: " + result.insertId);
                //return id of inserted row
                return callback(result.insertId);
            });
        } else {
            //if row was found | id selected
            //return id
            console.log("Kommune_id found: " + result[0].id);
            return callback(result[0].id);
        }
    });
};

//orgform, instsektorkode, naeringskode
var koder = (title, kode, beskrivelse, callback) => {
    //execute main query
    con.query(`SELECT id FROM ${title} WHERE kode='${kode}' AND beskrivelse='${beskrivelse}'`, function (err, result) {
        //throw error if error
        if (err) throw err;

        //if row was not found | id not selected
        //insert the row and return the id
        if (result.length == 0) {
            con.query(`INSERT INTO ${title} (kode, beskrivelse) VALUES ('${kode}', '${beskrivelse}')`, function (err, result) {
                //throw error if error
                if (err) throw err;
                console.log(`${title}_id found: ` + result.insertId);
                //return id of inserted row
                return callback(result.insertId);
            });
        } else {
            //if row was found | id selected
            //return id
            console.log(`${title}_id found: ` + result[0].id);
            return callback(result[0].id);
        }
    });
};

var land = (landkode, land, callback) => {
    //execute main query
    con.query(`SELECT id FROM land WHERE landkode='${landkode}' AND land='${land}'`, function (err, result) {
        //throw error if error
        if (err) throw err;

        //if row was not found | id not selected
        //insert the row and return the id
        if (result.length == 0) {
            con.query(`INSERT INTO land (landkode, land) VALUES ('${landkode}', '${land}')`, function (err, result) {
                //throw error if error
                if (err) throw err;
                console.log("1 record inserted: land_id = " + result.insertId);
                //return id of inserted row
                return callback(result.insertId);
            });
        } else {
            //if row was found | id selected
            //return id
            console.log("land_id found: " + result[0].id);
            return callback(result[0].id);
        }
    });
}


var poststed = (postnr, poststed, callback) => {
    //execute main query
    con.query(`SELECT id FROM poststed WHERE postnr='${postnr}' AND poststed='${poststed}'`, function (err, result) {
        //throw error if error
        if (err) throw err;
        //if row was not found | id not selected
        //insert the row and return the id
        if (result.length == 0) {
            con.query(`INSERT INTO poststed (postnr, poststed) VALUES ('${postnr}', '${poststed}')`, function (err, result) {
                //throw error if error
                if (err) throw err;
                console.log("poststed_id inserted: " + result.insertId);
                //return id of inserted row
                return callback(result.insertId);
            });
        } else {
            //if row was found | id selected
            //return id
            console.log("poststed_id found: " + result[0].id);
            return callback(result[0].id);
        }
    });
}

var adresser = (title, adresse, poststed_id, land_id, callback) => {
    //execute main query
    con.query(`SELECT id FROM ${title} WHERE adresse='${adresse}' AND poststed_id='${poststed_id}' AND land_id='${land_id}'`, function (err, result) {
        //throw error if error
        if (err) throw err;
        //if row was not found | id not selected
        //insert the row and return the id
        if (result.length == 0) {
            con.query(`INSERT INTO ${title} (adresse, poststed_id, land_id) VALUES ('${adresse}', '${poststed_id}', '${land_id}')`, function (err, result) {
                //throw error if error
                if (err) throw err;
                console.log(`${title} inserted: id = ` + result.insertId);
                //return id of inserted row
                return callback(result.insertId);
            });
        } else {
            //if row was found | id selected
            //return id
            console.log(`${title} found: id = ` + result[0].id);
            return callback(result[0].id);
        }
    });
}

var org = (orgnr, navn, ansatte, orgform_id, instsektor_id, naeringskode_id, stiftelsedato, regdato, sistaarsregnskap, konkurs, under_avvikling, under_tvangsavvikling, frivillighetsregisteret, stiftelsesregisteret, foretaksregisteret, forretningsadresse_id, kommune_nr_id, callback) => {
    //execute main query
    con.query(`SELECT id FROM org WHERE orgnr='${orgnr}'`, function (err, result) {
        //throw error if error
        if (err) throw err;

        //convert true/false statements to a mysql friendly int
        const convertTrueFalse = {
            true: 1,
            false: 0
        }

        //if row was not found | id not selected
        //insert the row and return the id
        if (result.length == 0) {
            con.query(`INSERT INTO org(
                orgnr, navn, ansatte, orgformkode_id, instsektorkode_id, naeringskode_id, stiftelsedato, regdato, sistaarsregnskap,
                konkurs, under_avvikling, under_tvangsavvikling, frivillighetsregisteret, stiftelsesregisteret, foretaksregisteret,
                forretningsadresse_id, kommune_nr_id)
                VALUES (
               '${orgnr}',
               '${navn}',
               '${ansatte}',
               '${orgform_id}',
               '${instsektor_id}',
               '${naeringskode_id}',
               '${stiftelsedato}',
               '${regdato}',
               '${sistaarsregnskap}',
               '${convertTrueFalse[konkurs]}',
               '${convertTrueFalse[under_avvikling]}',
               '${convertTrueFalse[under_tvangsavvikling]}',
               '${convertTrueFalse[frivillighetsregisteret]}',
               '${convertTrueFalse[stiftelsesregisteret]}',
               '${convertTrueFalse[foretaksregisteret]}',
               '${forretningsadresse_id}',
               '${kommune_nr_id}'
               )`, function (err, result) {
                //throw error if error
                if (err) throw err;

                console.log("1 Org inserted. id: " + result.insertId);
                //return id of inserted row
                return callback(result.insertId);
            });
        } else {
            //if row was found | id selected
            //return id
            console.log("Org found. id: " + result[0].id);
            return callback(result[0].id);
        }
    });
};
