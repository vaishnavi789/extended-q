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
var coping = [];
var vegetables = [];
var starches = [];
var proteins = [];

function getAllQuestion() {
    var ref = admin.database().ref("/").child('monitoring');
    var afterMonitoring = ref.once('value').then(function(snapshot) {
        var monitoringQuestions = []
        var obj = snapshot.val();
        for (var i in obj) {
            monitoringQuestions.push(obj[i]);
        }
        return monitoringQuestions;
    })
    var afterCoping = afterMonitoring.then(function(monitoringQuestions) {
        var data = {}
        data['monitoring'] = monitoringQuestions
        data['coping'] = []
        var cope = admin.database().ref("/").child('coping');
        var finishedCoping = cope.once('value').then(function(snapshot) {
            var copingQuestions = []
            var obj = snapshot.val();
            for (var i in obj) {
                copingQuestions.push(obj[i]);
            }
            return copingQuestions;
        })
        var returnedData = finishedCoping.then(function(copingQuestions) {
            data['coping'] = copingQuestions;
            return data;
        })
        return returnedData
    });
    var afterVeggies = afterCoping.then(function(returnedData) {
        var ref = admin.database().ref("/").child('vegetables').once('value').then(function(snapshot) {
            var veggiesList = []
            var obj = snapshot.val();
            for (var i in obj) {
                veggiesList.push(obj[i]);
            }
            return veggiesList;
        }).then(function(returnedVeggieList) {
            returnedData.vegetables = returnedVeggieList;
            return returnedData
        });
        return ref;
    });

    var afterProtein = afterVeggies.then(function(returnedData) {
        var ref = admin.database().ref("/").child('proteins').once('value').then(function(snapshot) {
            var proteinList = []
            var obj = snapshot.val();
            for (var i in obj) {
                proteinList.push(obj[i]);
            }
            return proteinList;
        }).then(function(returnedProteinList) {
            returnedData.proteins = returnedProteinList;
            return returnedData
        });
        return ref;
    });
    var afterStarches = afterVeggies.then(function(returnedData) {
        var ref = admin.database().ref("/").child('starches').once('value').then(function(snapshot) {
            var starchesList = []
            var obj = snapshot.val();
            for (var i in obj) {
                starchesList.push(obj[i]);
            }
            return starchesList;
        }).then(function(returnedStarchesList) {
            returnedData.starches = returnedStarchesList;
            return returnedData
        });
        return ref;
    });
    return afterStarches;
}


var monitorCount = 0;
var copingCount = 0;
var monitorAnswers = [];
var copeAnswers = [];
var date = 0;
var score = 0;

function monitorResult(ate, sugar, exercise, weight) {
    var result = "";
    if (ate == "yes" && sugar >= 8.5) {
        result += "Your blood sugar level of " + sugar + " is rather high. Try some light exercise, like taking a brisk walk. ";
    } else if (ate == "yes" && sugar < 8.5) {
        result += "Your blood sugar level of " + sugar + " is normal. That's great! ";
    } else if (ate == "no" && sugar > 7) {
        result += "Your blood sugar level of " + sugar + " is rather high. Try some light exercise, like taking a brisk walk. ";
    } else if (ate == "no" && sugar >= 4 && sugar <= 7) {
        result += "Your blood sugar level of " + sugar + " is normal. Keep it up! ";
    } else {
        result += "Your blood sugar is too low. I suggest eating a small amount of carbs. ";
    }
    return result;
}

function copingResult(answers) {
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

function writeMonAnswers(monitorAnswers) {
    var fb = admin.database().ref('/monitoringAnswers/patient1');
    fb.push({
        ate: monitorAnswers[0],
        glucose: monitorAnswers[1],
        medication: monitorAnswers[2],
        exercise: monitorAnswers[3],
        weight: monitorAnswers[4],
        timestamp: date
    }).then(function(ref) {
        console.log(ref);
    }, function(error) {
        console.log("Error:", error);
    });
}

function writeCopeAnswers(copeAnswers) {
    var fb = admin.database().ref('/copingAnswers/patient1');
    fb.push({
        one: copeAnswers[0],
        two: copeAnswers[1],
        three: copeAnswers[2],
        four: copeAnswers[3],
        five: copeAnswers[4],
        six: copeAnswers[5],
        seven: copeAnswers[6],
        eight: copeAnswers[7],
        //            nine: copeAnswers[8],
        score: score,
        timestamp: date
    }).then(function(ref) {
        console.log(ref);
    }, function(error) {
        console.log("Error:", error);
    });
}

getAllQuestion().then(function(returnVal) {
    monitoring = returnVal.monitoring
    coping = returnVal.coping
    vegetables = returnVal.vegetables
    proteins = returnVal.proteins
    starches = returnVal.starches


    const restService = express();

    restService.use(bodyParser.urlencoded({
        extended: true
    }));

    restService.use(bodyParser.json());
    restService.post('/reply', function(req, res) {
        var action = req.body.result.action;
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
                    console.log(monitorAnswers);
                    date = req.body.timestamp;
                    console.log(date);

                    writeMonAnswers(monitorAnswers);

                    text = "I'll get this logged for you ASAP. " +
                        monitorResult(ate, sugarLevel, exercise, weight);
                    //+ "What else can I do for you?";
                    break;
                }
                text = monitoring[monitorCount].title;

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
                    date = req.body.timestamp;
                    
                    text = "Thank you for answering my questions. " +
                        copingResult(copeAnswers);
                    writeCopeAnswers(copeAnswers);

                    break;
                }
                text = coping[copingCount].title;

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
                text = "I recommend filling 1/2 of your plate with " + vegetables[vIndex].type +
                    ", 1/4 with " + starches[sIndex].type + " , and 1/4 with " + proteins[pIndex].type +
                    ". If you want to change the plate, just say \"make another plate\".";
                break;

            case "restart":
                monitorCount = 0;
                copingCount = 0;
                monitorAnswers = [];
                text = "Sure thing. I've reset all the surveys so you can start from the beginning. What would you like to do now?";
                break;

            case "help":
                text = "I can assist you with monitoring your health, emotional coping with your diabetes, and food recommendations." +
                    " Just say any of the key words and we can get started!";
                break;

            default:
                text = "Error. Could not find appropriate action.";
        }
        return res.json({
            speech: text,
            displayText: text,
            source: "survey-demo-app"
        });
    });

    restService.get('/', function(req, res) {
        return "Hello and welcome.";
    });

    restService.listen((process.env.PORT || 8085), function() {
        console.log("Server up and running");
    });

});
