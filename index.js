const https = require("https");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const TOKEN = process.env.TOKEN
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
    if (req.body.events[0].type === "message") {
        const inputTxt = req.body.events[0].message.text
        console.log(`Got the message ${inputTxt} from the user`)

        const regex = /^(?:[1-9][0-9]{1,2}|1000)$/;
        if (!regex.test(inputTxt)) {
            return;
        }
        const drinkWater = Number(inputTxt);

        const dataString = JSON.stringify({
            replyToken: req.body.events[0].replyToken,
            messages: [
                {
                    type: "text",
                    text: drinkWater,
                },
            ],
        });

        const webhookOptions = {
            hostname: "api.line.me",
            path: "/v2/bot/message/reply",
            method: "POST",
            headers:  {
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
});

app.listen(PORT, () => {
    console.log(`Example app listening at ${PORT}`);
});
