var express = require('express');
var app = express();
var request = require('request');
var jwt = require('jsonwebtoken');

var KEY_ID = '56c8d3002d0f822f00151145';
var SECRET = '62Yxh5hAFBRlxpV_6GOpbtTq';
var signJwt = function(userId) {
    return jwt.sign({
        scope: 'app',
    },
    SECRET,
    {
        headers: {
            kid: KEY_ID
        }
    });
}

//var port = process.env.PORT || 1337;
//
//// Routing to the user
//app.use(express.static(__dirname + "/public"));
//
//app.get('/smooch', function (req, res) {
//    request({
//        url: 'http://api.smooch.io/v1/appusers/2daitql57gg85z3jurs6g16xf',
//        headers: {
//            authorization: 'Bearer ' + jwt
//        }
//    }, function(err, response, body){
//        console.log(body);
//    });
//});
//
//app.listen(port, function () {
//    console.log("Server is listening on port " + port.toString());
//});

var hello =  signJwt('idk');

console.log(hello);

    request({
        url: 'https://api.smooch.io/v1/webhooks',
        method: 'POST',
        headers: {
            authorization: 'Bearer ' + hello,
            "content-type": 'application/json'
        },
        body: JSON.stringify({"target":"http://mchackstest.azurewebsites.net/smooch"})
    }, function(err, response, body){
        console.log(body);
    });

