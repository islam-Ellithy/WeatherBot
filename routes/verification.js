var request = require('request');
var express = require('express');
var router = express.Router();
const fs = require('fs');

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

                msgSender = msg.sender.id;
                msgText = msg.message.text;
                if (msgSender && msgText) {

                    console.log(msgText);
                    addMsg(msgText);
                    sendText(msgSender, msgText);
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
    var token = "EAAI7Qf4HBZBEBAOjZAg3mvB8iivIyddka2UbgTnyA2x5FVGLJBrfclO8ufd3ZBSfazJl07TRuN2fxeg" +
            "pGGJvhjL6xhKFLDLEnz0tEdv4cI2MfOasWIAdPvVkUDB9GWvvZCZCp7hCEZAcMMM01F4x7iNue4eG2ZB" +
            "JcZBdMV8uQD4XhjLVMTNDHdfU";
    request({
        url: "https://graph.facebook.com/v2.6/me/messages?access_token=" + token,
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

module.exports = router;
