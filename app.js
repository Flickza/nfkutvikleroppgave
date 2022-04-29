//imports
import http from 'http';
import fs from 'fs';


//server configuration
const hostname = '127.0.0.1';
const port = 3000;

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