import express from 'express';
import line from '@line/bot-sdk';

const app = express();
app.get('/', (req, res) => {
    res.send('Hello');
});

app.get('/settings', async (req, res) => {
    res.send('Get setting done.');
    console.log('Get setting done.')
});

app.listen( 3000, async () => {
    console.log('listening on 3000');
});
