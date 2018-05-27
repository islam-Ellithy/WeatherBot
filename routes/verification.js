var express = require('express');
var router = express.Router();

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

    msg_events.array.forEach(element => {
        element.messaging.array.forEach(msg => {
            console.log(msg);
            res.sendStatus(200);
            res.send(msg);
        });
        
    });
});

module.exports = router;
