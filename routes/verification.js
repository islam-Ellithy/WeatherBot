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

    msg_events
        .array
        .forEach(element => {
            element
                .messaging
                .array
                .forEach(msg => {

                    msgSender = msg.sender.id;
                    msgText = msg.message.text;
                    if (msgSender && msgText) {

                        console.log(msgText);
                        addMsg(msgText);
                        sendText(msgSender, msgText);
                        res.sendStatus(200);
                    }
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
            access_token: 'EAAI7Qf4HBZBEBADCmdAnSlbZBzqfxJmgIf0XcpoQGZB2tKXLIctgXuyGMvUEBLEP0SijrKlXYVx2Nlh' +
                    'dSPApl4sXVLl1SGLofwzK4kiPgytT66VLp3ms1FB7eaDMBaOFRO0n2NNplG3t5MDt1Cm5AJegk1RUxFc' +
                    'BCAXGepmtVC06e4qQG6ZC'
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

module.exports = router;
