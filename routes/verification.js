var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    const hubChallenge = req.query['hub.challenge'];

    const hubMode = req.query['hub.mode'];
    const verifyTokenMatches = (req.query['hub.verify_token'] === 'crowdbotics');

    if (hubMode && verifyTokenMatches) {
        res
            .status(200)
            .send(hubChallenge);
    } else {
        res
            .status(403)
            .end();
    }
});

module.exports = router;
