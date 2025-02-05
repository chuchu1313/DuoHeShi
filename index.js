const express = require('express');
const line = require('@line/bot-sdk');

const app = express();
app.get('/', (req, res) => {
    res.send('Hello');
});

app.get('/settings', async (req, res) => {
    res.send('Get setting done.');
    console.log('Get setting done.');
});

app.listen(process.env.PORT || 3000, async () => {
    console.log('listening on 3000');
});
