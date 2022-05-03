import mysql from 'mysql';
import { DB_USERNAME, DB_PASSWORD } from '../../dbconfig.js';

//database configuration
var con = mysql.createConnection({
    host: 'localhost',
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: 'organisasjoner'
});


var kommune_select_insert = (kommune_nr, kommune_navn, callback) => {
    //execute main query
    con.query(`SELECT id FROM kommune WHERE kommunenr='${kommune_nr}' AND kommune_navn='${kommune_navn}'`, function (err, result) {
        //throw error if error
        if (err) throw err;

        //if row was not found | id not selected
        //insert the row and return the id
        if (result.length == 0) {
            con.query(`REPLACE INTO kommune (kommunenr, kommune_navn) VALUES ('${kommune_nr}', '${kommune_navn}')`, function (err, result) {
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
    con.query(`SELECT id FROM ${title} WHERE ${title}='${kode}' AND ${title}_beskrivelse='${beskrivelse}'`, function (err, result) {
        //throw error if error
        if (err) throw err;

        //if row was not found | id not selected
        //insert the row and return the id
        if (result.length == 0) {
            con.query(`REPLACE INTO ${title} (${title}, ${title}_beskrivelse) VALUES ('${kode}', '${beskrivelse}')`, function (err, result) {
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
            con.query(`REPLACE INTO land (landkode, land) VALUES ('${landkode}', '${land}')`, function (err, result) {
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
            con.query(`REPLACE INTO poststed (postnr, poststed) VALUES ('${postnr}', '${poststed}')`, function (err, result) {
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
    con.query(`SELECT id FROM ${title} WHERE adresse="${adresse}" AND poststed_id='${poststed_id}' AND land_id='${land_id}'`, function (err, result) {
        //throw error if error
        if (err) throw err;
        //if row was not found | id not selected
        //insert the row and return the id
        if (result.length == 0) {
            con.query(`INSERT INTO ${title} (adresse, poststed_id, land_id) VALUES ("${adresse}", '${poststed_id}', '${land_id}')`, function (err, result) {
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
    if (stiftelsedato == undefined) stiftelsedato = "";
    if (sistaarsregnskap == undefined) sistaarsregnskap = "";
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
               "${navn}",
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

var getConfig = (kommune_nr, naeringskode, instsektorkode, orgformkode, landkode, postnr, callback) => {
    var config = {
        "kommune_id": 0,
        "naering_id": 0,
        "instsektor_id": 0,
        "orgform_id": 0,
        "land_id": 0,
        "forretning_poststed_id": 0,
    };
    // console.log(kommune_nr, naeringskode, instsektorkode, orgformkode, landkode, postnr);
    //execute main query
    con.query(`SELECT id FROM kommune WHERE kommunenr='${kommune_nr}'`, function (err, result) {
        //throw error if error
        if (err) throw err;
        //if row was not found | id not selected
        //insert the row and return the id
        if (result.length > 0) {
            //return id of inserted row
            config.kommune_id = result[0].id;
            con.query(`SELECT id FROM naeringskode WHERE naeringskode='${naeringskode}'`, function (err, result) {
                //throw error if error
                if (err) throw err;
                if (result.length > 0) {
                    config.naering_id = result[0].id;
                    con.query(`SELECT id FROM instsektorkode WHERE instsektorkode='${instsektorkode}'`, function (err, result) {
                        if (err) throw err;
                        if (result.length > 0) {
                            config.instsektor_id = result[0].id;
                            con.query(`SELECT id FROM orgformkode WHERE orgformkode='${orgformkode}'`, function (err, result) {
                                if (err) throw err;
                                if (result.length > 0) {
                                    config.orgform_id = result[0].id;
                                    con.query(`SELECT id FROM land WHERE landkode='${landkode}'`, function (err, result) {
                                        if (err) throw err;
                                        if (result.length > 0) {
                                            config.land_id = result[0].id;
                                            con.query(`SELECT id FROM poststed WHERE postnr='${postnr}'`, function (err, result) {
                                                if (err) throw err;
                                                if (result.length > 0) {
                                                    config.forretning_poststed_id = result[0].id;
                                                    console.log(config);
                                                    return callback(config);
                                                } else {
                                                    console.log("postnr not found");
                                                    return;
                                                }
                                            });
                                        } else {
                                            console.log("land id not found");
                                            return;
                                        }
                                    });
                                } else {
                                    console.log("orgformkode id not found");
                                    return;
                                }
                            });
                        } else {
                            console.log("instsektorkode id not found");
                            return;
                        }
                    });
                } else {
                    console.log("naeringskode id not found");
                    return;
                }
            });
        } else {
            console.log("Kommune id not found");
            return;
        }
    });
};

var slettet_org = (orgnr, navn, slettedato, orgform_id, callback) => {
    //execute main query
    con.query(`SELECT id FROM org WHERE orgnr='${orgnr}'`, function (err, result) {
        //throw error if error
        if (err) throw err;
        //if row was not found | id not selected
        //insert the row and return the id
        if (result.length == 0) {
            con.query(`INSERT INTO org(
                        orgnr, navn, orgformkode_id, slettedato)
                        VALUES ('${orgnr}', "${navn}",'${orgform_id}', '${slettedato}')`, function (err, result) {
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

//function to slave data to database
var slaveInsert = async (orgData) => {
    if (!orgData.hasOwnProperty('naeringskode1') || !orgData.hasOwnProperty('institusjonellSektorkode')) return;
    var adresse;
    if (orgData.hasOwnProperty('forretningsadresse')) adresse = orgData.forretningsadresse;
    if (orgData.hasOwnProperty('postadresse')) adresse = orgData.postadresse;
    kommune_select_insert(adresse.kommunenummer, adresse.kommune, function (result) {
        console.log(result);
    });
    //naeringskode
    if (orgData.hasOwnProperty('naeringskode1')) {
        koder("naeringskode", orgData.naeringskode1.kode, orgData.naeringskode1.beskrivelse, function (result) {
            console.log(result);
        });
    }
    //institusjonellSektorkode
    if (orgData.hasOwnProperty('institusjonellSektorkode')) {
        koder("instsektorkode", orgData.institusjonellSektorkode.kode, orgData.institusjonellSektorkode.beskrivelse, function (result) {
            console.log(result);
        });
    }
    //organisasjonsform
    if (orgData.hasOwnProperty('institusjonellSektorkode')) {
        koder("orgformkode", orgData.organisasjonsform.kode, orgData.organisasjonsform.beskrivelse, function (result) {
            console.log(result);
        });
    };
    if (orgData.hasOwnProperty('postadresse') || orgData.hasOwnProperty('forretningsadresse')) {
        //adresse poststed
        poststed(adresse.postnummer, adresse.poststed, function (result) {
            console.log(result);
        });
        land(adresse.landkode, adresse.land, function (result) {
            console.log(result);
        });
    };
};



export { kommune_select_insert, koder, land, poststed, adresser, org, getConfig, slettet_org, slaveInsert };