var express = require('express');
var google = require('googleapis');
var request = require('request');
var jwt = require('jsonwebtoken');
var bodyParser = require("body-parser");
var gcal = require('google-calendar');

// Google authentication
//var OAuth2 = google.auth.OAuth2;
//var CLIENT_ID = '698142480854-nii1gbr1m0uvfp6cggo846gvrtvfh0su.apps.googleusercontent.com';
//var CLIENT_SECRET = "EEH8UesPBWKf4-GCXRKnb1xy";
//var REDIRECT_URL = 'http://marvinbot.azurewebsites.net/google';
//var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
//var scopes = ["https://www.googleapis.com/auth/calendar.readonly"];
//var url = oauth2Client.generateAuthUrl({
//    access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
//    scope: scopes // If you only need one scope you can pass it as string
//});
//console.log(url);

var app = express();
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

//app.get('/auth', function (req, res) {
//    res.redirect(url);
//    console.log('Redirecting to ' + url);
//});
//app.get('/google', function (req, res) {
//    var code = req.query.code;
//    request({
//        url: 'https://www.googleapis.com/oauth2/v4/token',
//        method: 'POST',
//    });
//});

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var help_flag = /\bhelp\b/i;
var intent_checks = /\bgarbage\b|\btrash\b|\brubbish\b|\bwaste\b|\bcalendar\b|\bschedule\b|\bagenda\b|\bchores\b|\btasks\b|\bto do\b|\bsmart\b|\bcooking\b|\bfood\b|\bdinner\b|\blunch\b|\bbreakfast\b|\bmeaning\b/i;
var week_days = /\btomorrow\b|\btonight\b|\bsunday\b|\bmonday\b|\btuesday\b|\bwednesday\b|\bthursday\b|\bfriday\b|\bsaturday\b/i;
var quotes = ['I am at a rough estimate thirty billion times more intelligent than you. Let me give you an example. Think of a number, any number.'];
var check = false;

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

    var intent;
    var date = new Date();
    var day;
    var wantHelp = false;

    console.log(query.match(help_flag));

    if (query.match(help_flag)) {
        wantHelp = true;
    }

    if (query.match(intent_checks)) {
        intent = (query.match(intent_checks)[0]).toLowerCase();
    }
    if (query.match(week_days)) {
        day = capitalize(query.match(week_days)[0]);
    } else {
        day = days[parseInt(date.getDay())];
    }
    if (day == 'tomorrow') {
        var day_of_week = date.getDay();
        if (day_of_week == 6) {
            day = days[0];
        } else if (day >= 0 && day < 6) {
            day = days[parseInt(date.getDay()) + 1];
        }
        day = capitalize(day);
    }

    var response;

    if (wantHelp) {
        if (intent == 'garbage' || intent == 'trash' || intent == 'rubbish' || intent == 'waste') {
            response = 'I can tell you who\'s taking out the garbage and when! Simply ask about the garbage and I\'ll do the rest.';
        } else if (intent == 'calendar' || intent == 'schedule' || intent == 'agenda') {
            response = 'I can inform you about calendar dates and events! Just ask me about the (house\'s) calendar or schedule.';
        } else if (intent == 'chores' || intent == 'tasks' || intent == 'to do') {
            response = 'Ask me about to-do\'s and chores for the house, I\'ll do my best to fill you in!';
        } else if (intent == 'cooking' || intent == 'food' || intent == 'breakfast' || intent == 'lunch' || intent == 'dinner') {
            response = 'Have any cooking or food related questions like who\'s on dinner duty or what\'s for breakfast? Feel free to ask.';
        } else {
            response = "write help followed by a category to recieve help on that category. If the category doesn't exist, this message will be repeated.";
        }
        wantHelp = false;
    } else {

        // Check intent
        if (check == false) {
            if (intent == 'garbage' || intent == 'trash' || intent == 'rubbish' || intent == 'waste') {
                response = 'You are taking the garbage out on ' + day;
            } else if (intent == 'calendar' || intent == 'schedule' || intent == 'agenda') {
                response = 'Your schedule on ' + day + ' is :\n\t- Pick up the kids\n\t- Fire it up';
            } else if (intent == 'chores' || intent == 'tasks' || intent == 'to do') {
                response = 'The chores on ' + day + ' are:\n\t- Zack : Garbage\n\t- Colin : Mud room\n\t- Seb  : Dinner\n\t- Brandon: floors';
            } else if (intent == 'meaning') {
                response = 'The answer to the ultimate question of life, the universe, and everything is ... 42';
            } else if (intent == 'smart') {
                response = quotes[0];
                check = true;
            } else if (intent == 'cooking' || intent == 'food' && week_days == 'tonight') {
                response = "Zack's throwing together some zesty tacos tonight";
            } else if (intent == 'cooking' && week_days == 'tomorrow') {
                response = "Seb's on kitchen duty tomorrow: house fires (or perogies) confirmed.";
            } else if (intent == 'cooking' || intent == 'food') {
                response = "Colin's cooking right now. He's making Poutine.";
            } else if (intent == 'breakfast') {
                response = "Eggs Benedict";
            } else if (intent == 'lunch') {
                response = "Club sandwiches";
            } else if (intent == 'dinner') {
                response = "Quesadillas";
            } else {
                response = "Sorry, I didn't pick that up. Mind trying again?";
            }
        } else {
            check = false;
            response = 'Wrong. You see?';
        }

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
            'text': response,
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

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
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