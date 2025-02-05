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
        console.log(`Got the message ${req.body.events[0].message.text}`)

        const dataString = JSON.stringify({
            replyToken: req.body.events[0].replyToken,
            messages: [
                {
                    type: "text",
                    text: req.body.events[0].message.text,
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
