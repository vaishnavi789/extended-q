/*'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const restService = express();

var monitoring = [
    {
        question: "Okay, have you eaten within the past 90 minutes?",
        type: "yesno"
    },
    {
        question: "Okay, what is your blood sugar level?",
        type: "number"
    },
    {
           question: "Have you taken your medication today?",
           type: "yesno"
    },
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
        question: "How often do you experience loneliness?",
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
        question: "Do you frequently leave your room or home?",
        type: "yesno"
    },
    {
        question: "How often do you feel negative things about yourself?",
        type: "frequency"
    },
    {
        question: "Can you sit at ease and feel relaxed?",
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
var monitorAnswers = [];
var copeAnswers = [];

restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.use(bodyParser.json());
*/

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const admin = require("firebase-admin");
const serviceAccount = require("./healthycoping-f6c2f-firebase-adminsdk-2k6pw-29793bc767.json");

admin.initializeApp({
 credential: admin.credential.cert(serviceAccount),
 databaseURL: "https://healthycoping-f6c2f.firebaseio.com/"
});

var monitoring = [];
//var coping = [];

var ref = admin.database().ref("/").child('monitoring');
ref.on("value", function(snapshot) {
  var obj = snapshot.val();
  for (var i = 0; i < obj.length; i++) {
         monitoring.push(obj[i]);
  }
}, function (errorObject) {
console.log("The read failed: " + errorObject.code);
});
console.log(monitoring);

var coping = [
    {
        question: "Okay, how often do you feel tense or wound up?",
        type: "frequency"
    },
    {
        question: "How often do you experience loneliness?",
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
        question: "Do you frequently leave your room or home?",
        type: "yesno"
    },
    {
        question: "How often do you feel negative things about yourself?",
        type: "frequency"
    },
    {
        question: "Can you sit at ease and feel relaxed?",
        type: "yesno"
    },
    {
        question: "How often do you dwell on worrying thoughts?",
        type: "frequency"
    }
];

var vegetables = [];
var starches = [];
var proteins = [];

var veg = admin.database().ref("/").child('vegetables');
veg.on("value", function(snapshot) {
var obj = snapshot.val();
for (var i in obj ) {
       vegetables.push(obj[i]);
}
}, function (errorObject) {
console.log("The read failed: " + errorObject.code);
});
console.log(vegetables);

var pro = admin.database().ref("/").child('proteins');
pro.on("value", function(snapshot) {
var obj = snapshot.val();
for (var i in obj ) {
       proteins.push(obj[i]);
}
}, function (errorObject) {
console.log("The read failed: " + errorObject.code);
});
console.log(proteins);

var starch = admin.database().ref("/").child('starches');
starch.on("value", function(snapshot) {
  var obj = snapshot.val();
  for (var i in obj ) {
         starches.push(obj[i]);
  }
}, function (errorObject) {
console.log("The read failed: " + errorObject.code);
});
console.log(starches);


var monitorCount = 0;
var copingCount = 0;
var monitorAnswers = [];
var copeAnswers = [];

const restService = express();

restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.use(bodyParser.json());

restService.post('/reply', function (req, res) {
    var action = req.body.result.action;
    //var previous_action = req.body.result.parameters.monitorAction;
    var text;

    switch (action) {
        case "monitoring.continue":
          action = "start.monitor";


        case "start.monitor":
          if (monitorCount >= monitoring.length) {
              if (req.body.result.parameters.number.length != 0) {
                monitorAnswers.push(req.body.result.parameters.number);
              } else if (req.body.result.parameters.yesno.length != 0) {
                monitorAnswers.push(req.body.result.parameters.yesno);
              }
              monitorCount = 0;

              var ate = monitorAnswers[0];
              var sugarLevel = monitorAnswers[1];
              var medication = monitorAnswers[2];
              var exercise = monitorAnswers[3];
              var weight = monitorAnswers[4];

              text = "I'll get this logged for you ASAP. "
                +  monitorResult(ate, sugarLevel, exercise, weight);
                //+ "What else can I do for you?";
              break;
          }
          text = monitoring[monitorCount].question;

          if (req.body.result.parameters.number.length != 0) {
                monitorAnswers.push(req.body.result.parameters.number);
          } else if (req.body.result.parameters.yesno.length != 0) {
                monitorAnswers.push(req.body.result.parameters.yesno);
          }

          monitorCount++;
          break;

        case "coping.continue":
            action = "start.coping";

        case "start.coping":
          if (copingCount >= coping.length) {
              if (req.body.result.parameters.frequency.length != 0) {
                copeAnswers.push(req.body.result.parameters.frequency);
             } else if (req.body.result.parameters.yesno.length != 0) {
                copeAnswers.push(req.body.result.parameters.yesno);
             }
              copingCount = 0;
               
              console.log(copeAnswers);
              text = "Thank you for answering my questions. "
                + copingResult(copeAnswers);
              
              break;
          }
          text = coping[copingCount].question;

          if (req.body.result.parameters.frequency.length != 0) {
                copeAnswers.push(req.body.result.parameters.frequency);
          } else if (req.body.result.parameters.yesno.length != 0) {
                copeAnswers.push(req.body.result.parameters.yesno);
          }

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
          break;

        case "restart":
           monitorCount = 0;
           copingCount = 0;
           monitorAnswers = [];
           text = "Sure thing. I've reset all the surveys so you can start from the beginning. What would you like to do now?";
           break;

        case "help":
            text = "I can assist you with monitoring your health, emotional coping with your diabetes, and food recommendations."
                +   " Just say any of the key words and we can get started!";
            break;

        default:
          text = "Error. Could not find appropriate action.";
    }
      return res.json({
          speech: text,
          displayText: text,
          source: "survey-demo-app"});
});

function monitorResult (ate, sugar, exercise, weight) {
    var result = "";
    if (ate == "yes" && sugar >= 8.5) {
        result += "Your blood sugar level of " + sugar + " is rather high. Try some exercise. ";
    } else if (ate == "yes" && sugar < 8.5) {
        result += "Your blood sugar level of " + sugar + " is normal. That's great! ";
    } else if (ate == "no" && sugar > 7) {
        result += "Your blood sugar level of " + sugar + " is rather high. Try some exercise. ";
    } else if (ate == "no" && sugar >= 4 && sugar <= 7) {
        result += "Your blood sugar level of " + sugar + " is normal. Keep it up! ";
    } else {
        result += "Your blood sugar is too low. I suggest eating a small amount of carbs. ";
    }

    return result;
}

function copingResult (answers) {
    var score = 0;
    var result = "";
    for (var i = 0; i < answers.length; i++) {
        if (answers[i] == "no") {
            score += 2;
        } else if (answers[i] == "often") {
            score += 2;
        } else if (answers[i] == "sometimes") {
            score += 1;
        }
    }
    console.log(score);
    
    if (score > 11 && score <= 16) {
        result += "You are showing signs of severe depression. Please consider asking your doctor for help. ";
    } else if (score >= 6 && score <= 11) {
        result += "You are showing signs of moderate depression. Consider discussing this with your doctor.";
    } else {
        result += "You seem to be doing all right! I'm glad.";
    }
    
    return result;
}

restService.get('/', function (req, res) {
    return "Hello and welcome.";
});

restService.listen((process.env.PORT || 8080), function () {
  console.log("Server up and running");
});
