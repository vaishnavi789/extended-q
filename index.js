'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const restService = express();

var questions = [
    {
        question: "What is your blood sugar level?",
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

restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.use(bodyParser.json());

restService.post('/reply', function (req, res) {
    var action = req.body.result.action;
    if (action === "take.survey") {
        if (count >= questions.length) {
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

restService.listen((process.env.PORT || 8080), function () {
  console.log("Server up and running");
});
