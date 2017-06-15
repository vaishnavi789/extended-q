'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const restService = express();

var monitoring = [ //omitted yesno questions for now; cause issues when two intents reference the same entity.
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
    },
    {
        question: "How often do you feel negative things about yourself?",
        type: "frequency"
    },
    {
        question: "Can you usually sit at ease and feel relaxed?",
        type: "yesno"
    },
    {
        question: "How often do you dwell on worrying thoughts?",
        type: "frequency"
    }
];

var monitorCount = 0;
var copingCount = 0;

var vegetables = ["chillies", "carrots", "cabbage", "eggplant", "cauliflower", "broccoli", "tomatoes", "spinach", "peppers"];
var starches = ["brown rice", "squash", "green peas", "yams", "sweet potato", "pasta", "potatoes"];
var proteins = ["chicken", "beans", "fish", "crab", "shrimp", "eggs", "turkey", "beef", "pork"];

restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.use(bodyParser.json());

restService.post('/reply', function (req, res) {
    var action = req.body.result.action;
    switch (action) {
      case "start.monitor":
          if (monitorCount >= monitoring.length) {
              monitorCount = 0;
              return res.json({
                  speech: "I'll get this logged for you ASAP. Is there anything else I can do for you?",
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
          break;
      case "start.coping":
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
          break;

      case "food.plate":
          var vDecider = Math.random() * vegetables.length;
          var vIndex = Math.floor(vDecider);
          var sDecider = Math.random() * starches.length;
          var sIndex = Math.floor(sDecider);
          var pDecider = Math.random() * proteins.length;
          var pIndex = Math.floor(pDecider);
          var text = "I recommend filling your plate with 1/4th of " + vegetables[vIndex]
                + ", 1/4th of " + starches[sIndex] + " , and 1/2 of " + proteins[pIndex]
                + ". If you want to change the plate, just say \"make another plate\".";;
          return res.json({
              speech: text,
              displayText: text,
              source: "survey-demo-app"
          });
          /*if (!req.body.result.parameters.vegetables) {
              var decider = Math.random() * vegetables.length;
              var index = Math.floor(decider);
              var text = "I recommend adding " + vegetables[index] + " to your plate.";
              return res.json({
                  speech: text,
                  displayText: text,
                  source: "survey-demo-app"
              });
          }
          else if (!req.body.result.parameters.main-dish-protein) {
              var decider = Math.random() * protein.length;
              var index = Math.floor(decider);
              var text = "I recommend adding " + protein[index] + " to your plate.";
              return res.json({
                  speech: text,
                  displayText: text,
                  source: "survey-demo-app"
              });
          }
          else if (!req.body.result.parameters.starches) {
              var decider = Math.random() * starches.length;
              var index = Math.floor(decider);
              var text = "I recommend adding " + starches[index] + " to your plate.";
              return res.json({
                  speech: text,
                  displayText: text,
                  source: "survey-demo-app"
              });
          }
          */
          break;

      default:
          return res.json({
              speech: "error",
              displayText: "error",
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
