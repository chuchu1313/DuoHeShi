const express = require('express');
const line = require('@line/bot-sdk');

const app = express();

app.post('/webhook', async (req, res) => {
    res.send('Hello');
    console.log('webhook.');
});

app.listen(process.env.PORT || 3000, async () => {
    console.log('listening on 3000');
});
