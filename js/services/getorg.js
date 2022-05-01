import mysql from 'mysql';
import { DB_USERNAME, DB_PASSWORD } from '../../dbconfig.js';

//database configuration
var con = mysql.createConnection({
    host: 'localhost',
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: 'organisasjoner'
});


var getOrgs = async () => {
    return new Promise((resolve, reject) => {
        con.connect(function (err) {
            if (err) throw err;
            console.log("Connected!");
            con.query(`SELECT * FROM org
            INNER JOIN orgform ON org.orgformkode_id = orgform.id
            INNER JOIN naeringskode ON org.naeringskode_id = naeringskode.id
            INNER JOIN kommune ON org.kommune_nr_id = kommune.id
            INNER JOIN forretningsadresse ON org.forretningsadresse_id = forretningsadresse.id
            WHERE org.id BETWEEN 3600 AND 3615
            `, function (err, result, fields) {
                if (err) throw err;
                resolve(result);
            });
        });
    });
}

export default getOrgs;