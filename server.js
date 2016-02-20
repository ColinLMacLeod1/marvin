var express = require('express');
var app = express();
var request = require('request');
var smoochCore = require('smooch-core');

var skPromise = new smoochCore({
    appToken: '2l2dp4kzrozc474iargieo763'
});

var port = process.env.PORT || 1337;

// Routing to the user
app.use(express.static(__dirname + "/public"));

app.get('/smooch', function (req, res) {
    res.send(skPromise);
})

app.listen(port, function () {
    console.log("Server is listening on port " + port.toString());
});