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
                            let location = response.result.parameters['location'];
                            let date = response.result.parameters['date-time'];
                            //result = 'welcome ' + city; 
                            if (!city)
                                if (location)
                                    city = location;
                            result = getWeather(senderId, city);
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
    /* request.get(restUrl, (err, response, body) => {
         if (!err && response.statusCode == 200) {
             sendText(senderId, 'msg');

             let json = JSON.parse(body);
             let msg = json.weather[0].description + ' and the temperature is ' + json.main.temp + ' ℉';
             return msg;
         } else {
             sendText(senderId, err.message);
             return 'I failed to look up the city name.';
         }
     });*/

    var axios = require('axios');

    axios.get(restUrl)
        .then(response => {

            let json = response.data;
            let msg = json.weather[0].description + ' and the temperature is ' + json.main.temp + ' ℉';
            sendText(senderId, msg);

        })
        .catch(error => {
            sendText(senderId, error.message);

        });

    /*
             https.get(restUrl, (resp) => {
             let data = '';

             // A chunk of data has been recieved.
             resp.on('data', (chunk) => {
                 data += chunk;
             });

             // The whole response has been received. Print out the result.
             resp.on('end', () => {
                 let json = data;
                 let msg = json.weather[0].description + ' and the temperature is ' + json.main.temp + ' ℉';
                 sendText(senderId, msg);
                 console.log(JSON.parse(data).explanation);
             });

         }).on("error", (err) => {
             console.log("Error: " + err.message);
         });
     */
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
                text
            }
        }
    });
};

module.exports = router;