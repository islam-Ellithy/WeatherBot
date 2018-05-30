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
                var attachment = 'location'; //msg.attachments[0].type;

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
                                var restUrl = 'http://api.openweathermap.org/data/2.5/weather?appid=c550788d001ff159854a8faa1a4066b7&mode=json&units=metric&q=' + city;
                                getWeather(senderId, restUrl);
                            }

                        } else if (msg.hasOwnProperty('attachments')) {
                            if (attachments[0].hasOwnProperty('type')) {
                                if (attachments[0].hasOwnProperty('type') === 'location')
                                    var cord = msg.attachments[0].payload.coordinates;

                                var restUrl = 'http://api.openweathermap.org/data/2.5/weather?appid=c550788d001ff159854a8faa1a4066b7&mode=json&units=metric&lat=' + '31.24' + '&lon=' + '30.05';

                                getWeather(senderId, restUrl);

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



function getWeather(senderId, url) {

    var axios = require('axios');
    //var restUrl = 'http://api.openweathermap.org/data/2.5/weather?appid=c550788d001ff159854a8faa1a4066b7&mode=json&units=metric&q=' + city;

    //var restUrl = 'http://api.openweathermap.org/data/2.5/weather?appid=c550788d001ff159854a8faa1a4066b7&mode=json&units=metric&lat=' + '31.24' + '&lon=' + '30.05';

    axios.get(url)
        .then(response => {

            let json = response.data;
            let msg = json.weather[0].description + ' and the temperature is ' + json.main.temp + ' ℉';
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
                text: message,
                quick_replies: [{
                    content_type: "location"
                }]
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
                text: "Here is a quick reply!",
                quick_replies: [{
                        content_type: "text",
                        title: "Search",
                        payload: "<POSTBACK_PAYLOAD>",
                        image_url: "http://s3.eu-central-1.amazonaws.com/arcadeforge/images/urls/000/000/108/original/green-ball-md.png?1447365921"
                    },
                    {
                        content_type: "location"
                    }
                ]
            }
        }
    });
}



module.exports = router;