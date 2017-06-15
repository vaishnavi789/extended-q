'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const restService = express();

var monitoring = [
    //{
    //    question: "Okay, did you check your blood glucose level after eating?",
    //    type: "yesno"
    //},
    {
        question: "What is your blood sugar level?",
        type: "number"
    },
    //{
    //    question: "Have you taken your medication today?",
    //    type: "yesno"
    //},
    {
        question: "How many minutes have you exercised today?",
        type: "duration"
    },
    {
        question: "How many pounds do you weigh today?",
        type: "unit-weight"
    }
];

var coping = [
    {
        question: "How often do you feel tense or wound up?",
        type: "frequency"
    },
    {
        question: "Have you socialized with anyone today?",
        type: "yesno"
    },
    {
        question: "Do you feel motivated to go about your day?",
        type: "yesno"
    },
    {
        question: "How often do you go outside of your room or home?",
        type: "frequency"
    },
    {
        question: "Are you feeling tired or lonely?",
        type: "yesno"
    }
];

var monitorCount = 0;
var copingCount = 0;

restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.use(bodyParser.json());

restService.post('/reply', function (req, res) {
    var action = req.body.result.action;
    if (action === "start.monitor") {
        if (monitorCount >= monitoring.length) {
            monitorCount = 0;
            return res.json({
                speech: "I'll get this logged for you ASAP. Thanks for the info!",
                displayText: "I'll get this logged for you ASAP. Is there anything else I can do for you?",
                source: "survey-demo-app"
            });
        }
        var text = monitoring[monitorCount].question;
        monitorCount++;
        console.log(text)
        return res.json({
            speech: text,
            displayText: text,
            source: "survey-demo-app"
        });
    }
    else if (action === "start.coping") {
        if (copingCount >= coping.length) {
            copingCount = 0;
            return res.json({
                speech: "Thank you! That's all the questions. Is there anything else I can help you with?",
                displayText: "Thank you! That's all the questions. Is there anything else I can help you with?",
                source: "survey-demo-app"
            });
        }
        var text = coping[copingCount].question;
        copingCount++;
        console.log(text)
        return res.json({
            speech: text,
            displayText: text,
            source: "survey-demo-app"
        });
    }
});

restService.get('/', function (req, res) {
    return "Hello and welcome.";
});

restService.listen((process.env.PORT || 8080), function () {
  console.log("Server up and running");
});


/*
'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const firebase = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");

const restService = express();

var questions = [
    {
        question: "What was your blood sugar reading?",
        type: "number"
    },
    {
        question: "Did you check your blood glucose level after eating?",
        type: "yesno"
    },
    {
        question: "How many minutes have you exercised today?",
        type: "number"
    },
    {
        question: "How often do you go outside of your room or home?",
        type: "frequency"
    },
    {
        question: "Have you taken your medication today?",
        type: "yesno"
    },
    {
        question: "How often do you feel tense or wound up?",
        type: "frequency"
    },
    {
        question: "Have you socialized with anyone today?",
        type: "yesno"
    },
    {
        question: "Do you feel motivated to go about your day?",
        type: "yesno"
    },
    {
        question: "Are you feeling tired or lonely?",
        type: "yesno"
    }
];

var count = 0;
var surveyId = "xxxxx";
var user_surveys = [];

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://survey-5054c.firebaseio.com/"
    //lol
});

restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.use(bodyParser.json());

function getSurveys(uid, callback) {
    var userRef = firebase.database().ref('/blueprints' + uid);
    userRef.once("value").then(function (snapshot) {
        var surveys = snapshot.val().survey;
        callback(surveys);
    }).catch(function (error) {
        console.log("Failed to send notification to user: ", error);
    });
}

function takeSurvey(result) {
    if (result === undefined) {
        console.log("Undefined");
        return {
            "displayText": "undefined",
            "speech": "undefined"
        };
    }
    var responses = {
        "displayText": "",
        "speech": ""
    };
    /* PARAMETERS ********************************************************** */
    /*
    if (result.parameters.yesno === "yes") {
        responses.displayText = "" + user_surveys[0].title;
        responses.speech = "" + user_surveys[0].title;
    } else {
        responses.displayText = "Good bye!";
        responses.speech = "Good bye!";
    }
    return responses;
}

function saveResponse (result, uid) {
    var answerRef = firebase.database().ref("/data/" + uid + "/answers");
    answersRef.push(result);
    return;
}

restService.post('/reply', function (req, res) {
    var action = req.body.result.action;
    if (action === "take.survey") {
        if (count >= questions.length) {
            count = 0;
            return res.json({
                speech: "That's all! Thank you for answering my questions.",
                displayText: "That's all! Thank you for answering my questions.",
                source: "survey-demo-app"
            });
        }
        var text = questions[count].question;
        count++;
        console.log(text)
        return res.json({
            speech: text,
            displayText: text,
            source: "survey-demo-app"
        });
    }
});

restService.get('/', function (req, res) {
    return "Hello and welcome.";
});

restService.listen((process.env.PORT || 8080), function () {
  console.log("Server up and running");
});
*/
