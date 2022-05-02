/* Install express on to the terminal by typing this: `npm i express`, you should
have node installed. */

import express from 'express';
const app = express();
import getOrgs from './services/getorg.js';


/* This action will happen if the user connects to the website, to do the action
if they are in a certain route, just do /<your route name>*/
app.get('/', function(req, res) {
  res.sendFile('/static/html/index.html', {root: "./" })
});
app.get('/api/organisasjoner', async function(req, res) {
  await getOrgs().then(result => {
    res.send(result);
  });
});

app.get('/locale', function(req, res) {
  res.sendFile('/node_modules/bootstrap-table/dist/locale/bootstrap-table-nb-NO.js', {root: "./" })
});
app.use('/static', express.static('static'))




const PORT = 3000
// On localhost:3000 you will see your page.
app.listen(PORT);


