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
    res.send("HTTP POST request sent to the webhook URL!");
    const event = req.body.events[0];
    if (event.source.type !== "group") return;
    const groupId = event.source.groupId;
    const userId = event.source.userId;
    if (event.type === "message") {
        const inputTxt = event.message.text;
        console.log(`Got the message ${inputTxt} from the user`);
        const regex = /^(?:[1-9][0-9]{1,2}|1000)$/;

        if (!regex.test(inputTxt)) {
            return;
        }
        // add to today's water intake
        if (!LOCAL_CACHE[groupId]) {
            LOCAL_CACHE[groupId] = {};
        }
        if (!LOCAL_CACHE[groupId][userId]) {
            LOCAL_CACHE[groupId][userId] = {};
        }

        const date = new Date();
        const formattedDate = date.toLocaleDateString('en-CA');
        const drankWater = Number(inputTxt);
        let previousWater = LOCAL_CACHE[groupId][userId][formattedDate] || 0;
        const totalWater = previousWater + drankWater;
        LOCAL_CACHE[groupId][userId][formattedDate] = totalWater;

        returnDrankWater(req, drankWater, totalWater);
    }
});

const config = {
    channelId: BOT_ID,
    channelSecret: SECRET,
    channelAccessToken: TOKEN

};

const client = new line.Client(config);

setInterval(function () {
    console.log('Start Cronjob running');
    console.log(LOCAL_CACHE);
    const date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    console.log(minutes)
    if(minutes !== 0) return;

    const formattedDate = date.toLocaleDateString('en-CA');
    hours += 8;
    const DRINK_MAP = {
        10: 200,
        11: 300,
        12: 400,
        13: 500,
        14: 700,
        15: 1000,
        16: 1200,
        17: 1400,
        18: 1600,
    };
    if (hours >= 10 && hours <= 18) {
        Object.keys(LOCAL_CACHE).forEach((groupId) => {
            Object.keys(LOCAL_CACHE[groupId]).forEach((userId) => {
                console.log(`Cronjob ${groupId}, ${userId}, ${formattedDate}, ${LOCAL_CACHE[groupId][userId][formattedDate]} <= ${DRINK_MAP[hours]} `);
                if (!LOCAL_CACHE[groupId][userId][formattedDate] || LOCAL_CACHE[groupId][userId][formattedDate] <= DRINK_MAP[hours]) {
                    console.log(`Drink water: ${LOCAL_CACHE[groupId][userId][formattedDate]}, should >= ${DRINK_MAP[hours]}`);
                    const previousWater = LOCAL_CACHE[groupId][userId][formattedDate] || 0;
                    client.getProfile(userId)
                        .then((profile) => {
                            const message = {
                                type: 'text',
                                text: `$ ${profile.displayName} \n 喝水量只有 ${previousWater} \n 要喝到 ${DRINK_MAP[hours]} \n 快喝水💧！`,
                                emojis: [
                                    {
                                        index: 0,  // "$" 在字串中的位置
                                        productId: "670e0cce840a8236ddd4ee4c", // LINE emoji 套件 ID
                                        emojiId: "009" // （LINE emoji ID）
                                    }
                                ]
                            };
                            client.pushMessage(groupId, message)
                                .then(() => {
                                    console.log('Message sent: ' + userId);
                                })
                                .catch((err) => {
                                    console.error('Error sending message: ', err);
                                });
                        });
                }
            });
        });
    }
}, 1000 * 60); // 每1小時檢查一次

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
