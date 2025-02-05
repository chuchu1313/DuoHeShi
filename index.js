const https = require("https");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const line = require('@line/bot-sdk');

const LOCAL_CACHE = {};
const TOKEN = process.env.TOKEN;
const SECRET = process.env.SECRET;
const BOT_ID = process.env.BOT_ID;
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

app.get("/", (req, res) => {
    res.sendStatus(200);
});


app.post("/webhook", function (req, res) {
    console.log(req.body);
    console.log(req.body.events[0]);
    console.log(req.body.events[0].source);
    res.send("HTTP POST request sent to the webhook URL!");
    if (req.body.events[0].type === "message") {
        const inputTxt = req.body.events[0].message.text;
        console.log(`Got the message ${inputTxt} from the user`);
        const regex = /^(?:[1-9][0-9]{1,2}|1000)$/;

        if (!regex.test(inputTxt)) {
            return;
        }
        // add to today's water intake
        if (!LOCAL_CACHE[req.body.events[0].source.userId]) {
            LOCAL_CACHE[req.body.events[0].source.userId] = {};
        }
        const date = new Date();
        const formattedDate = date.toLocaleDateString('en-CA');
        const drankWater = Number(inputTxt);
        let previousWater = 0;
        previousWater = LOCAL_CACHE[req.body.events[0].source.userId][formattedDate] || 0;
        const totalWater = previousWater + drankWater;
        LOCAL_CACHE[req.body.events[0].source.userId][formattedDate] = totalWater;

        returnDrankWater(req, drankWater, totalWater);
    }
});
//
// const config = {
//     channelId: BOT_ID,
//     channelSecret: SECRET,
//     channelAccessToken: TOKEN
//
// };
// const client = new line.Client(config);
// setInterval(function () {
//     const now = new Date();
//     const hours = now.getHours();  // 當前小時（24 小時制）
//
//     if (hours >= 10 && hours <= 18s) {
//         Object.keys(LOCAL_CACHE).forEach((userId) => {
//             const message = {
//                 type: 'text',
//                 text: '今天喝水量不足，快喝水！',
//                 mentions: [{
//                     userId: userId
//                 }]
//             };
//             client.pushMessage(, message)
//                 .then(() => {
//                     console.log('Message sent: ' + userId);
//                 })
//                 .catch((err) => {
//                     console.error('Error sending message: ', err);
//                 });
//         });
//
//     }
// }, 1000 * 60);

app.listen(PORT, () => {
    console.log(`Example app listening at ${PORT}`);
});


function returnDrankWater(req, drankWater, totalWater) {
    const dataString = JSON.stringify({
        replyToken: req.body.events[0].replyToken,
        messages: [
            {
                type: "text",
                text: `${drankWater}/${totalWater}`,
            },
        ],
    });
    console.log(`${drankWater}/${totalWater}`);

    const webhookOptions = {
        hostname: "api.line.me",
        path: "/v2/bot/message/reply",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + TOKEN,
        },
        body: dataString,
    };

    // Define our request
    const request = https.request(webhookOptions, (res) => {
        res.on("data", (d) => {
            process.stdout.write(d);
        });
    });

    request.on("error", (err) => {
        console.error(err);
    });

    request.write(dataString);
    request.end();
}
