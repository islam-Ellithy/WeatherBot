var request = require('request');
var express = require('express');
var api = require('apiai');
var router = express.Router();
const fs = require('fs');
const API_AI_TOKEN = 'cc36a07568d44ab8937834d5550fb748';
const apiAiClient = require('apiai')(API_AI_TOKEN);
const FACEBOOK_ACCESS_TOKEN = "EAAI7Qf4HBZBEBAOjZAg3mvB8iivIyddka2UbgTnyA2x5FVGLJBrfclO8ufd3ZBSfazJl07TRuN2fxeg" +
    "pGGJvhjL6xhKFLDLEnz0tEdv4cI2MfOasWIAdPvVkUDB9GWvvZCZCp7hCEZAcMMM01F4x7iNue4eG2ZB" +
    "JcZBdMV8uQD4XhjLVMTNDHdfU";



const https = require('https');



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
                    const apiaiSession = apiAiClient.textRequest(message, {
                        sessionId: 'WeatherBot'
                    });


                    apiaiSession.on('response', (response) => {

                        var result = response.result.fulfillment.speech;

                        if (response.result.action === 'weather') {
                            let city = response.result.parameters['geo-city'];
                            let location = response.result.parameters['location']['city'];
                            let date = response.result.parameters['date-time'];
                            //result = 'welcome ' + city; 
                            sendText(senderId, location);
                            flag = false;
                            if (city.length > 0) {
                                flag = true;
                            } else if (city.length === 0 && location.length > 0) {
                                city = location
                                flag = true;
                            }

                            if (flag) {
                                getWeather(senderId, city);
                            }

                        } else {
                            sendText(senderId, result);
                        }

                    });

                    apiaiSession.on('error', error => console.log(error));
                    apiaiSession.end();

                }
                res.sendStatus(200);
            });
    });
});



function getWeather(senderId, city) {

    var restUrl = 'http://api.openweathermap.org/data/2.5/weather?appid=c550788d001ff159854a8faa1a4066b7&mode=json&units=metric&q=' + city;
    var axios = require('axios');

    axios.get(restUrl)
        .then(response => {

            let json = response.data;
            let msg = city + '\n' + json.weather[0].description + ' and the temperature is ' + json.main.temp + ' ℉';
            sendText(senderId, msg);

        })
        .catch(error => {
            sendText(senderId, error.message);

        });
}

function sendText(id, message) {
    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: {
            access_token: FACEBOOK_ACCESS_TOKEN
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
                text,
                "quick_replies": [{
                        "content_type": "text",
                        "title": "Search",
                        "payload": "<POSTBACK_PAYLOAD>",
                        "image_url": "data:image/jpeg;base64,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"
                    },
                    {
                        "content_type": "location"
                    }
                ]
            }
        }
    });
};

module.exports = router;