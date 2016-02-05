var HTTPS = require('https');
var cool = require('cool-ascii-faces');

var botID = process.env.BOT_ID;

// This module is used to permanently store global variables.
var stateModule = (function() {
    var ccLink; // Private Variable for ClashCaller link
    var wsLink; // Private Variable for WarSheet link
    
    var pub = {}; // public object - returned at end of module

    // Changes the ClashCaller link
    pub.changeccLink = function(newstate) {
        ccLink = newstate;
    };
    // Changes the WarSheet link
    pub.changewsLink = function(newstate) {
        wsLink = newstate;
    };

    // Returns ClashCaller link.
    pub.getccLink = function() {
        return ccLink;
    }
    // Returns WarSheet link.
    pub.getwsLink = function() {
        return wsLink;
    }

    return pub; // Exposes the requested variable
}());

function checkccLink(linkText) {
    substring = "//clashcaller.com/war";
    if (linkText.indexOf(substring) > -1) {
        stateModule.changeccLink(linkText);
        return "ClashCaller Link Saved!";
    } else {
        return "Sorry, " + "\"" + linkText + "\"" + " is not a valid clashcaller link.";
    }
}

function respond() {
    var request = JSON.parse(this.req.chunks[0]),
    botCommands = /^\/commands/; // Prints a list of commands
    botCool = /^\/cool/; // Prints a random face
    botSaveCC = /^\/setcc/i; // Saves a ClashCaller link
    botPrintCC = /^\/cc/; // Prints the ClashCaller link
    botSaveWS = /^\/setws/i; // Saves a War Sheet
    botPrintWS = /^\/ws/; // Prints the War Sheet
    botPrintCW = /^\/cw/; // Prints the ClashCaller and WarSheet together.

    if (request.text && botCommands.test(request.text)) {
        this.res.writeHead(200);
        postMessage("List of commands: \n \
                    /commands - Prints this list \n \
                    /setcc - Sets the ClashCaller link \n \
                    /cc - Prints the ClashCaller link \n \
                    /setws - Sets the War Sheet \n \
                    /ws - Prints the War Sheet \n \
                    /cw - Prints the ClashCaller and War Sheet"
                    );
        this.res.end();
    }
    if (request.text && botCool.test(request.text)) {
        this.res.writeHead(200);
        postMessage(cool());
        this.res.end();
    // SaveCC check link test
    } else if (request.text && botSaveCC.test(request.text)) {
        var someText = request.text.slice(6);
        this.res.writeHead(200);
        postMessage(checkccLink(someText));
        this.res.end();
/*
    } else if (request.text && botSaveCC.test(request.text)) {
        var someText = request.text.slice(6);
        stateModule.changeccLink(someText);
        this.res.writeHead(200);
        postMessage("ClashCaller link saved!");
        this.res.end();
*/
    } else if (request.text && botPrintCC.test(request.text)) {
        var theState = stateModule.getccLink();
        this.res.writeHead(200);
        postMessage(theState);
        this.res.end();
    } else if (request.text && botSaveWS.test(request.text)) {
        var someText = request.text.slice(6);
        stateModule.changewsLink(someText);
        this.res.writeHead(200);
        postMessage("War Sheet Saved!");
        this.res.end();
    } else if (request.text && botPrintWS.test(request.text)) {
        var theState = stateModule.getwsLink();
        this.res.writeHead(200);
        postMessage(theState);
        this.res.end();
    } else if (request.text && botPrintCW.test(request.text)) {
        var theState = stateModule.getccLink();
        var theState2 = stateModule.getwsLink();
        this.res.writeHead(200);
        postMessage(theState + "\n" + theState2);
        this.res.end();
    } else {
        console.log("don't care");
        this.res.writeHead(200);
        this.res.end();
    }
}

function postMessage(response) {
    var botResponse, options, body, botReq;

    botResponse = response

    options = {
        hostname: 'api.groupme.com',
        path: '/v3/bots/post',
        method: 'POST'
    };

    body = {
        "bot_id": botID,
        "text": botResponse
    };

    console.log('sending ' + botResponse + ' to ' + botID);

    botReq = HTTPS.request(options, function(res) {
        if (res.statusCode == 202) {
            //neat
        } else {
            console.log('rejecting bad status code ' + res.statusCode);
        }
    });

    botReq.on('error', function(err) {
        console.log('error posting message ' + JSON.stringify(err));
    });

    botReq.on('timeout', function(err) {
        console.log('timeout posting message ' + JSON.stringify(err));
    });
    botReq.end(JSON.stringify(body));
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

exports.respond = respond;
