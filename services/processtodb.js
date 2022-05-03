import convertxlsx from '../static/js/xlsxtoarray.js';
import mysql from 'mysql';
import fetch from 'node-fetch';
import { DB_USERNAME, DB_PASSWORD } from '../dbconfig.js';
import { kommune_select_insert, koder, land, poststed, adresser, org, slettet_org, slaveInsert, getConfig } from './mysql/functions.js';

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

var unhandled = [];
var errors = [];
for (let i = 0; i < orgliste.length; i++) {
    (async () => {
        try {
            await fetch(`https://data.brreg.no/enhetsregisteret/api/enheter/${orgliste[i]}`)
                .then(response => {
                    if (response.ok) return response.json();
                    if (!response.ok) {
                        unhandled.push(orgliste[i]);
                        return;
                    };
                })
                .then(async orgData => {
                    if (await orgData != undefined) {
                        await main(orgData);
                        return;
                    } else {
                        unhandled.push(orgliste[i]);
                        return;
                    }
                });
        } catch (error) {
            if (error.errno == "ETTIMEDOUT") {
                unhandled.push(orgliste[i]);
                errors.push(error.errno);
            }
        }
    })();
}


//function to insert data
var main = async (orgData) => {
    await orgData;
    var adresse;
    if (orgData.hasOwnProperty('forretningsadresse')) adresse = orgData.forretningsadresse;
    if (orgData.hasOwnProperty('postadresse')) adresse = orgData.postadresse;
    //kommune_nr, naeringskode, instsektorkode, orgformkode, landkode, postnr, callback
    getConfig(adresse.kommunenummer, orgData.naeringskode1.kode, orgData.institusjonellSektorkode.kode, orgData.organisasjonsform.kode, adresse.landkode, adresse.postnummer, function (result) {
        if (orgData.hasOwnProperty('slettedato') && orgData.slettedato != null) {
            slettet_org(orgData.organisasjonsnummer, orgData.navn, orgData.slettedato, config.orgform_id, function (result) {
                console.log(result);
            });
        } else {
            var config = result;
            console.log(config);
            adresser("forretningsadresse", adresse.adresse[0], config.forretning_poststed_id, config.land_id, function (result) {
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
                    });
            });
        }
    });
};