var request = require('request');
var express = require('express');
var router = express.Router();
const fs = require('fs');
const API_AI_TOKEN = 'cc36a07568d44ab8937834d5550fb748';
const apiAiClient = require('apiai')(API_AI_TOKEN);
const FACEBOOK_ACCESS_TOKEN = "EAAI7Qf4HBZBEBAOjZAg3mvB8iivIyddka2UbgTnyA2x5FVGLJBrfclO8ufd3ZBSfazJl07TRuN2fxeg" +
        "pGGJvhjL6xhKFLDLEnz0tEdv4cI2MfOasWIAdPvVkUDB9GWvvZCZCp7hCEZAcMMM01F4x7iNue4eG2ZB" +
        "JcZBdMV8uQD4XhjLVMTNDHdfU";

router.get("/", function (req, res, next) {

    console.log('webhook');
    if (req.query['hub.verify_token'] === 'try') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send("requested recevied new");
    }
});

router.post("/", function (req, res, next) {

    var msg_events = req.body.entry;

    console.log(req);

    msg_events.forEach(element => {
        element
            .messaging
            .forEach(msg => {

                const senderId = msg.sender.id;
                const message = msg.message.text;

                if (senderId && message) {

                    const apiaiSession = apiAiClient.textRequest(message, {sessionId: 'crowdbotics_bot'});

                    apiaiSession.on('response', (response) => {
                        const result = response.result.fulfillment.speech;

                        sendText(senderId, result);
                    });

                    apiaiSession.on('error', error => console.log(error));
                    apiaiSession.end();

                }
                res.sendStatus(200);

            });

    });
});

function addMsg(msg) {
    fs
        .appendFile('message.txt', msg, function (err) {
            if (err) 
                console.log('error');
            console.log('Saved!');
        });
}
function sendText(id, message) {
    request({
        url: "https://graph.facebook.com/v2.6/me/messages?access_token=",
        qs: {
            FACEBOOK_ACCESS_TOKEN
        },
        method: "POST",
        json: {
            recipient: {
                id: id
            },
            message: {
                text: message
            }
        }
    });
}

const sendTextMessage = (senderId, text) => {
    request({
        url: 'https: //graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: FACEBOOK_ACCESS_TOKEN
        },
        method: 'POST',
        json: {
            recipient: {
                id: senderId
            },
            message: {
                text
            }
        }
    });
};

module.exports = router;
