const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');

const app = express();
const port = 8000;
const options = {
    key: fs.readFileSync(__dirname + '/../selfsigned.key'),
    cert: fs.readFileSync(__dirname + '/../selfsigned.crt')
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/*
https.createServer(options, app).listen(port, () => {
    console.log(`App 2 listening on port ${port}`);
});
*/

app.listen(port, () => {
    console.log(`App 2 listening on port ${port}`);
});
