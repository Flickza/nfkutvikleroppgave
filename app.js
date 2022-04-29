//imports
import http from 'http';
import fs from 'fs';
import fetch from 'node-fetch';
import mysql from 'mysql';


//server configuration
const hostname = '127.0.0.1';
const port = 3000;

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'main',
    password: 'adminadmin',
    database: 'organisasjoner'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Server!');
});

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    fs.readFile('./index.html', (err, data) => {
        if (err) {
            res.statusCode = 500;
            res.end('Error');
        } else {
            res.end(data);
        }
    });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});