var express = require('express');
var app = express();
var request = require('request');
var jwt = require('jsonwebtoken');
var bodyParser = require("body-parser");
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

var port = process.env.PORT || 1337;

// Routing to the user
app.use(express.static(__dirname + "/public"));

app.post('/smooch', function (req, res) {
    console.log(req.body.messages[0].text);
    //    request({
    //        url: 'http://api.smooch.io/v1/appusers/2daitql57gg85z3jurs6g16xf',
    //        headers: {
    //            authorization: 'Bearer ' + jwt
    //        }
    //    }, function(err, response, body){
    //        console.log(body);
    //    });
});

app.listen(port, function () {
    console.log("Server is listening on port " + port.toString());
});
//
var hello = signJwt('idk');
//
//console.log(hello);


//    request({
//        url: 'https://api.smooch.io/v1/webhooks',
//        method: 'POST',
//        headers: {
//            authorization: 'Bearer ' + hello,
//            "content-type": 'application/json'
//        },
//        body: JSON.stringify({"target":"https://a2c8f1f4.ngrok.io/smooch"})
//    }, function(err, response, body){
//        console.log(body);
//    });
//
//

// code for nuance

 (function(){


        //Set these to avoid having to enter them everytime
        var URL = 'wss://httpapi.labs.nuance.com/v1?';

        var APP_ID = "NMDPTRIAL_sebastian_kolosa_gmail_com20160220122318"
        var APP_KEY = "1fbc7a22dc7af909d5f3022d067583c31cf39f483bdbcde1a6f1805ff5f74a14b3c5368f3f2f9814239a412910c4ec2cb78c75f26742d40d33546c284bb73dff"
        var USER_ID = "sebastian"
        var NLU_TAG = ""


        var userMedia = undefined;
        navigator.getUserMedia = navigator.getUserMedia
        || navigator.webkitGetUserMedia
        || navigator.mozGetUserMedia
        || navigator.msGetUserMedia;


        if(!navigator.getUserMedia){
            console.log("No getUserMedia Support in this Browser");
        }
        
        navigator.getUserMedia({
            audio:true
        }, function(stream){
            userMedia = stream;
        }, function(error){
            console.error("Could not get User Media: " + error);
        });

        //
        // APP STATE
        var isRecording = false;
        // NODES
        var $content = $('#content');
        var $url = $('#url');
        var $appKey = $('#app_key');
        var $appId = $('#app_id');
        var $userId = $('#user_id');
        var $nluTag = $('#nlu_tag');
        var $textNluTag = $("#text_nlu_tag");
        var $connect = $('#connect');
        var $ttsGo = $('#tts_go');
        var $ttsText = $('#tts_text');
        var $ttsDebug = $('#tts_debug_output');
        var $asrRecord = $('#asr_go');
        var $asrLabel = $('#asr_label');
        var $nluExecute = $('#nlu_go');
        var $asrViz = $('#asr_viz');
        var $asrDebug = $('#asr_debug_output');
        var $nluDebug = $('#nlu_debug_output');
        var $asrVizCtx = $asrViz.get()[0].getContext('2d');

        var dLog = function dLog(msg, logger){
            var d = new Date();
            logger.prepend('<div><em>'+d.toISOString()+'</em> &nbsp; <pre>'+msg+'</pre></div>');
        };


        //
        // Connect
        function connect() {

            // INIT THE SDK
            Nuance.connect({
                appId: $appId.val(),
                appKey: $appKey.val(),
                userId: $userId.val(),
                url: $url.val(),

                onopen: function() {
                    console.log("Websocket Opened");
                    $content.addClass('connected');
                },
                onclose: function() {
                    console.log("Websocket Closed");
                    $content.removeClass('connected');
                },
                onmessage: function(msg) {
                    console.log(msg);
                    if(msg.message == "volume") {
                       viz(msg.volume);
                    } else if (msg.result_type == "NMDP_TTS_CMD") {
                        dLog(JSON.stringify(msg, null, 2), $ttsDebug);
                    } else if (msg.result_type == "NDSP_ASR_APP_CMD") {
                        if(msg.nlu_interpretation_results.status === 'success'){
                            dLog(JSON.stringify(msg, null, 2), $asrDebug);
                        } else {
                            dLog(JSON.stringify(msg.nlu_interpretation_results.payload.interpretations, null, 2), $asrDebug);
                        }
                    } else if (msg.result_type === "NDSP_APP_CMD") {
                        if(msg.nlu_interpretation_results.status === 'success'){
                            dLog(JSON.stringify(msg.nlu_interpretation_results.payload.interpretations, null, 2), $nluDebug);
                        } else {
                            dLog(JSON.stringify(msg, null, 2), $nluDebug);
                        }
                    }
                },
                onerror: function(error) {
                    console.error(error);
                    $content.removeClass('connected');
                }

            });
        };
        $connect.on('click', connect);

        $url.val(URL || '');
        $appId.val(APP_ID || '');
        $appKey.val(APP_KEY || '');
        $userId.val(USER_ID || '');
        $nluTag.val(NLU_TAG || '');
        $textNluTag.val(NLU_TAG || '');


        // Disconnect
        $(window).unload(function(){
            Nuance.disconnect();
        });




        //
        // TTS
        function tts(evt){
            Nuance.playTTS({
                language: 'eng-USA',
                voice: 'ava',
                text: $ttsText.val()
            });
        };
        $ttsGo.on('click', tts);


        //
        // ASR / NLU
        function asr(evt){
            if(isRecording) {
                Nuance.stopASR();
                $asrLabel.text('RECORD');
            } else {
                cleanViz();

                var options = {
                    userMedia: userMedia
                };
                if($nluTag.val()) {
                    options.nlu = true;
                    options.tag = $nluTag.val();
                }
                Nuance.startASR(options);
                $asrLabel.text('STOP RECORDING');
            }
            isRecording = !isRecording;
        };
        $asrRecord.on('click', asr);


        // NLU / Text
        function textNlu(evt){

            //to give you a template on what text and tag should be...
            var options = {
                text: [STRING PARAMETER GOES HERE],
                tag: "M1724_A918"
            };

            //call this with your function w the string parameter and the tag given
            Nuance.startTextNLU(options);
        }
        $nluExecute.on('click', textNlu);

        //
        // ASR Volume visualization

        window.requestAnimFrame = (function(){
            return  window.requestAnimationFrame       ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame    ||
                    function(callback, element){
                        window.setTimeout(callback, 1000 / 60);
                    };
        })();

        var asrVizData = {};
        function cleanViz(){
            var parentWidth = $asrViz.parent().width();
            $asrViz[0].getContext('2d').canvas.width = parentWidth;
            asrVizData = {
                w: parentWidth,
                h: 256,
                col: 0,
                tickWidth: 0.5
            };
            var w = asrVizData.w, h = asrVizData.h;
            $asrVizCtx.clearRect(0, 0, w, h); // TODO: pull out height/width
            $asrVizCtx.strokeStyle = '#333';
            var y = (h/2) + 0.5;
            $asrVizCtx.moveTo(0,y);
            $asrVizCtx.lineTo(w-1,y);
            $asrVizCtx.stroke();
            asrVizData.col = 0;
        };

        function viz(amplitudeArray){
            var h = asrVizData.h;
            requestAnimFrame(function(){
                // Drawing the Time Domain onto the Canvas element
                var min = 999999;
                var max = 0;
                for(var i=0; i<amplitudeArray.length; i++){
                    var val = amplitudeArray[i]/asrVizData.h;
                    if(val>max){
                        max=val;
                    } else if(val<min){
                        min=val;
                    }
                }
                var yLow = h - (h*min) - 1;
                var yHigh = h - (h*max) - 1;
                $asrVizCtx.fillStyle = '#6d8f52';
                $asrVizCtx.fillRect(asrVizData.col,yLow,asrVizData.tickWidth,yHigh-yLow);
                asrVizData.col += 1;
                if(asrVizData.col>=asrVizData.w){
                    asrVizData.col = 0;
                    cleanViz();
                }
            });
        };
        cleanViz();

    })();