'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const restService = express();

var monitoring = [ //omitted yesno questions for now; causes issues when two intents reference the same entity.
//     {
//         question: "Okay, did you check your blood glucose level after eating?",
//         type: "yesno"
//     },
    {
        question: "Okay, what is your blood sugar level?",
        type: "number"
    },
//     {
//         question: "Have you taken your medication today?",
//         type: "yesno"
//     },
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
        question: "Okay, how often do you feel tense or wound up?",
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
    var previous_action = req.body.result.parameters.monitorAction;
    var text;
    
    switch (action) {
//       case "previous.context":
//           action = previous_action;
            
      case "start.monitor":
          if (monitorCount >= monitoring.length) {
              monitorCount = 0;
              text = "I'll get this logged for you ASAP. Is there anything else I can do for you?";
              break;
          }
          text = monitoring[monitorCount].question;
          monitorCount++;
          break;
            
      case "start.coping":
          if (copingCount >= coping.length) {
              copingCount = 0;
              text = "Thank you! That's all the questions. Is there anything else I can help you with?";
              break;
          }
          text = coping[copingCount].question;
          copingCount++;
          break;
            
      //dietary advice action based on the diabetes.org "food plate" page.
      case "food.plate":
          var vDecider = Math.random() * vegetables.length;
          var vIndex = Math.floor(vDecider);
          var sDecider = Math.random() * starches.length;
          var sIndex = Math.floor(sDecider);
          var pDecider = Math.random() * proteins.length;
          var pIndex = Math.floor(pDecider);
          text = "I recommend filling 1/2 of your plate with " + vegetables[vIndex]
                + ", 1/4 with " + starches[sIndex] + " , and 1/4 with " + proteins[pIndex]
                + ". If you want to change the plate, just say \"make another plate\".";;
          //Ignore this for now.
          /*if (!req.body.result.parameters.vegetables) {
              var decider = Math.random() * vegetables.length;
              var index = Math.floor(decider);
              text = "I recommend adding " + vegetables[index] + " to your plate.";
          }
          else if (!req.body.result.parameters.main-dish-protein) {
              var decider = Math.random() * protein.length;
              var index = Math.floor(decider);
              text = "I recommend adding " + protein[index] + " to your plate.";
          }
          else if (!req.body.result.parameters.starches) {
              var decider = Math.random() * starches.length;
              var index = Math.floor(decider);
              text = "I recommend adding " + starches[index] + " to your plate.";
          }
          */
          break;

      default:
          text = "Error. Could not find appropriate action.";
    }
      return res.json({
          speech: text,
          displayText: text,
          source: "survey-demo-app"});
});

restService.get('/', function (req, res) {
    return "Hello and welcome.";
});

restService.listen((process.env.PORT || 8080), function () {
  console.log("Server up and running");
});
