const express = require('express');
const app = express();

const appPort = 3000;

app.use(express.static('public'))

app.get('/', function (req, res) {
  res.send('index.html');
})

app.listen(appPort, function () {
  console.log(`Listening on port ${appPort}`);
})