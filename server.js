var express = require('express');
var app = express();
var request = require('request');
var jwt = require('jsonwebtoken');
var bodyParser = require("body-parser");
var WunderlistSDK = require('wunderlist');
var $ = require('jquery');

//Wunderlist Credentials
var client_id = 'd08ba8eaa21b0bec5a0a';
var callback_url = 'http://mchackstest.azurewebsites.net/wunderlist';
var access_token;


//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var KEY_ID = '56c8d3002d0f822f00151145';
var SECRET = '62Yxh5hAFBRlxpV_6GOpbtTq';
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

var wunderlistAPI = new WunderlistSDK({
  'accessToken': 'a user access_token',
  'clientID': 'your client_id'
});

var port = process.env.PORT || 1337;

// Routing to the user
app.use(express.static(__dirname + "/public"));

// Post request from Smooch
app.post('/smooch', function (req, res) {
    var query = req.body.messages[0].text;
    console.log(query);
    request({
        url: 'https://api.smooch.io/v1/appusers/56c8d3002d0f822f00151145/conversation/messages',
        mehtod: 'POST',
        headers: {
            authorization: 'Bearer ' + hello,
            "content-type": 'application/json'
        },
        body: JSON.stringify({'text':query, 'role':'appMaker'})
    }, function(err, response, body){
        console.log(body);
    })
});

request({
    url: 'https://www.wunderlist.com/oauth/authorize?client_id=' + client_id + '&redirect_uri=' + callback_url +'&state=hjajbasdfnvcjjd',
}, function(err, response, body){
    //console.log(body);
});



app.listen(port, function () {
    console.log("Server is listening on port " + port.toString());
});
//
var hello = signJwt('idk');

// Use this to create a new websocket!
//console.log(hello);


//    request({
//        url: 'https://api.smooch.io/v1/webhooks',
//        method: 'POST',
//        headers: {
//            authorization: 'Bearer ' + hello,
//            "content-type": 'application/json'
//        },
//        body: JSON.stringify({"target":"http://mchackstest.azurewebsites.net/smooch", "triggers": ["message:appUser"]})
//    }, function(err, response, body){
//        console.log(body);
//    });

