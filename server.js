var express = require('express');
var google = require('googleapis');
var request = require('request');
var jwt = require('jsonwebtoken');
var bodyParser = require("body-parser");
var gcal     = require('google-calendar');

// Google authentication
var OAuth2 = google.auth.OAuth2;
var CLIENT_ID = '698142480854-nii1gbr1m0uvfp6cggo846gvrtvfh0su.apps.googleusercontent.com';
var CLIENT_SECRET = "EEH8UesPBWKf4-GCXRKnb1xy";
var REDIRECT_URL = 'http://marvinbot.azurewebsites.net/google';
var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
var scopes = ["https://www.googleapis.com/auth/calendar.readonly"];
var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
    scope: scopes // If you only need one scope you can pass it as string
});
console.log(url);

var app = express();
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.get('/auth', function (req, res) {
    res.redirect(url);
    console.log('Redirecting to ' + url);
});
app.get('/google', function (req, res) {
    var code = req.query.code;
    request({
        url: 'https://www.googleapis.com/oauth2/v4/token',
        method: 'POST',
    });
});


var intent_checks = /\bgarbage\b|\btrash\b|\brubbish\b|\bcalendar\b|\bschedule\b|\bagenda\b|\bchores\b|\btasks\b|\bto do\b|\bmeaning\b/i;

var KEY_ID = '56c930cf933bcc2a00e9166f';
var SECRET = 'GZ5goIxmVGV_p977jcpi-iOC';

var signJwt = function (userId) {
    return jwt.sign({
            scope: 'app',
        },
        SECRET, {
            headers: {
                kid: KEY_ID
            }
        });
}
var hello = signJwt('idk');

var port = process.env.PORT || 1337;

// Routing to the user
app.use(express.static(__dirname + "/public"));

// Post request from Smooch
app.post('/smooch', function (req, res) {

    var query = req.body.messages[0].text;

    var id = req.body.appUser._id;
    if (req.body.messages[0].type === 'appMaker') {
        return res.end();
    }
    console.log(id);
    console.log(query);
    var intent = (query.match(intent_checks)[0]).toLowerCase();

    if (intent == 'garbage' || intent == 'trash' || intent == 'rubbish') {
        console.log('Garbage time');
    } else if (intent == 'calendar' || intent == 'schedule' || intent == 'agenda') {
        console.log('Fire it Marvin');
    } else if (intent == 'chores' || intent == 'tasks' || intent == 'to do') {
        console.log('Floor marshall is in the house');
    } else if (intent == 'meaning') {
        query = 'The answer to the ultimate question of life, the universe, and everything is ... 42';
    }

    console.log(intent);
    request({
        url: 'https://api.smooch.io/v1/appusers/' + id + '/conversation/messages',
        method: 'POST',
        headers: {
            authorization: 'Bearer ' + hello,
            "content-type": 'application/json'
        },
        body: JSON.stringify({
            'text': intent,
            'role': 'appMaker'
        })
    }, function (err, response, body) {
        if (err) {
            console.log(err);
        } else {
            console.log('Message sent successfully');
        }
    });

    res.end();
});

app.listen(port, function () {
    console.log("Server is listening on port " + port.toString());
});
//


// Use this to create a new websocket!
//    request({
//        url: 'https://api.smooch.io/v1/webhooks',
//        method: 'POST',
//        headers: {
//            authorization: 'Bearer ' + hello,
//            "content-type": 'application/json'
//        },
//        body: JSON.stringify({"target":"http://marvinbot.azurewebsites.net/smooch", "triggers": ["message:appUser"]})
//    }, function(err, response, body){
//        console.log(body);
//    });

//    request({
//        url: 'https://api.smooch.io/v1/webhooks',
//        method: 'GET',
//        headers: {
//            authorization: 'Bearer ' + hello,
//            "content-type": 'application/json'
//        },
////        body: JSON.stringify({"target":"http://d4931e2b.ngrok.io/smooch", "triggers": ["message:appUser"]})
//    }, function(err, response, body){
//        console.log(JSON.parse(body).webhooks);
//    });

//    request({
//        url: 'https://api.smooch.io/v1/webhooks/56c93131a99fed2900ca1619',
//        method: 'DELETE',
//        headers: {
//            authorization: 'Bearer ' + hello,
//            "content-type": 'application/json'
//        },
////        body: JSON.stringify({"target":"http://d4931e2b.ngrok.io/smooch", "triggers": ["message:appUser"]})
//    }, function(err, response, body){
//        console.log(JSON.parse(body).webhooks[0]);
//    });