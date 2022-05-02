import mysql from 'mysql';
import { DB_USERNAME, DB_PASSWORD } from '../dbconfig.js';

//database configuration
var con = mysql.createPool({
    connectionLimit: 1000,
    host: 'localhost',
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: 'organisasjoner'
});


var getOrgs = async () => {
    return new Promise((resolve, reject) => {
        //get all orgs data
        con.query(`SELECT * FROM org
            INNER JOIN orgformkode ON org.orgformkode_id = orgformkode.id
            INNER JOIN naeringskode ON org.naeringskode_id = naeringskode.id
            INNER JOIN instsektorkode ON org.instsektorkode_id = instsektorkode.id
            INNER JOIN kommune ON org.kommune_nr_id = kommune.id
            INNER JOIN forretningsadresse ON org.forretningsadresse_id = forretningsadresse.id
            ORDER BY org.id ASC
            `, function (err, result, fields) {
            if (err) throw err;
            //filter TINYINTS to readable string values
            result.filter((data) => {
                if (data.konkurs == 1) {
                    data.konkurs = "JA";
                } else {
                    data.konkurs = "NEI";
                }
                if (data.under_avvikling == 1) {
                    data.under_avvikling = "JA";
                } else {
                    data.under_avvikling = "NEI";
                }
                if (data.under_tvangsavvikling == 1) {
                    data.under_tvangsavvikling = "JA";
                } else {
                    data.under_tvangsavvikling = "NEI";
                }
            });
            var resultArray = [];
            //reformat mysql response to fit datatable in html
            result.forEach((result) => {
                resultArray.push({
                    "id": result.id,
                    "orgnr": result.orgnr,
                    "navn": result.navn,
                    "ansatte": result.ansatte,
                    "orgformkode_id": {
                        "orgformkode": result.orgformkode,
                        "orgformkode_beskrivelse": result.orgformkode_beskrivelse,
                    },
                    "instsektorkode_id": {
                        "instsektorkode": result.instsektorkode,
                        "instsektorkode_beskrivelse": result.instsektorkode_beskrivelse
                    },
                    "naeringskode_id": {
                        "naeringskode": result.naeringskode,
                        "naeringskode_beskrivelse": result.naeringskode_beskrivelse
                    },
                    "stiftelsedato": result.stiftelsedato,
                    "regdato": result.regdato,
                    "sistaarsregnskap": result.sistaarsregnskap,
                    "status": {
                        "text": `<i class="bi bi-info-circle"></i>`,
                        "konkurs": result.konkurs,
                        "under_avvikling": result.under_avvikling,
                        "under_tvangsavvikling": result.under_tvangsavvikling,
                    },
                    "frivillighetsregisteret": result.frivillighetsregisteret,
                    "stiftelsesregisteret": result.stiftelsesregisteret,
                    "foretaksregisteret": result.foretaksregisteret,
                    "kommune_nr_id": {
                        "kommunenr": result.kommunenr,
                        "kommune_navn": result.kommune_navn,
                    },
                    "forretningsadresse_id": {
                        "adresse": result.adresse,
                        "poststed_id": result.poststed_id,
                        "land_id": result.land_id
                    }
                });
            })
            resolve(resultArray);
        });
    });
}

export default getOrgs;