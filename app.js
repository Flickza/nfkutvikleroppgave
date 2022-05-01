//imports
import http from 'http';
import fs from 'fs';


//server configuration
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    if (req.url === "/") {
        fs.readFile('./index.html', (err, html) => {
            if (err) {
                res.statusCode = 500;
                res.end('Error');
            } else {
                res.setHeader('Content-type', 'text/html');
                res.write(html);
                res.statusCode = 200;
                res.end();
            }
        });
    } else if (req.url === '/styles.css') {
        res.setHeader('Content-type', 'text/css');
        res.write(fs.readFileSync('./css/styles.css'));
        res.end();
    } else if (req.url === '/table.js') {
        res.setHeader('Content-type', 'text/javascript');
        res.write(fs.readFileSync('./js/table.js'));
        res.end();
    } else {
        res.write("invalid request")
        res.end();
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});