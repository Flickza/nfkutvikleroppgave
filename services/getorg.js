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


var getOrgs = async (x) => {
    return new Promise((resolve, reject) => {
            con.query(`SELECT * FROM org
            INNER JOIN orgformkode ON org.orgformkode_id = orgformkode.id
            INNER JOIN naeringskode ON org.naeringskode_id = naeringskode.id
            INNER JOIN instsektorkode ON org.instsektorkode_id = instsektorkode.id
            INNER JOIN kommune ON org.kommune_nr_id = kommune.id
            INNER JOIN forretningsadresse ON org.forretningsadresse_id = forretningsadresse.id
            WHERE org.id BETWEEN 1 AND ${x}
            `, function (err, result, fields) {
                if (err) throw err;
                resolve(result);
            });
    });
}

export default getOrgs;