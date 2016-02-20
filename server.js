var express = require('express');
var app = express();
var request = require('request');
var Smooch = require('smooch');

Smooch.init({
    appToken: '2daitql57gg85z3jurs6g16xf'
});

var port = process.env.PORT || 1337;

// Routing to the user
app.use(express.static(__dirname + "/public"));

app.get('/', function (req, res) {
    request('http://www.google.com', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body) // Show the HTML for the Google homepage. 
        }
    })
})

app.listen(port, function () {
    console.log("Server is listening on port " + port.toString());
});