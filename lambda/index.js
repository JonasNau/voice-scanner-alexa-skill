"use strict"
/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require("ask-sdk-core");


//Custom Modules
const axios = require('axios').default;
const objectFunctions = require("./includes/object-functions");
const { voiceScannerClient } = require("./includes/voiceScannerClient")

const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiIzIiwidXVpZCI6ImM2OGNlZmJjLTIzNjQtNDhhYi1hMzkwLWFkNjcwY2E2ZWJmZCIsInVzZXJuYW1lIjoiSm9uYXMiLCJwYXNzd29yZCI6IiQyYSQxMCRwL0NIY3gyN1U1WjhpNEQ2M3l6bkVlaGc5Rno3Z0xiTjVHTzJuWFExODRLejVNbWFja0Y4VyIsImNyZWF0ZWQiOiJGcmkgQXVnIDE5IDIwMjIgMjA6MzY6NDEgR01UKzAyMDAgKE1pdHRlbGV1cm9ww6Rpc2NoZSBTb21tZXJ6ZWl0KSIsImxhc3RMb2dpbiI6bnVsbCwibGFzdFB3ZENoYW5nZSI6bnVsbCwiZ3JvdXBzIjpbImFkbWluIl0sInBlcm1pc3Npb25zIjp7fSwiaXNGb3JiaWRkZW5UbyI6W10sImV4cGlyZXMiOiJuZXZlciIsImlhdCI6MTY2MTE2ODQwMH0.lLARdA-oRfDlNzNS1wlhvAOQgLXPj1Mxyj333g9tXjM";


function callDirectiveService(handlerInput, speakOutput) {
  // Call Alexa Directive Service.
  const requestEnvelope = handlerInput.requestEnvelope;
  const directiveServiceClient = handlerInput.serviceClientFactory.getDirectiveServiceClient();

  const requestId = requestEnvelope.request.requestId;
  const endpoint = requestEnvelope.context.System.apiEndpoint;
  const token = requestEnvelope.context.System.apiAccessToken;

  // build the progressive response directive
  const directive = {
    header: {
      requestId,
    },
    directive: {
      type: "VoicePlayer.Speak",
      speech: speakOutput
    },
  };
  // send directive
  return directiveServiceClient.enqueue(directive, endpoint, token);
}


//Eintrittspunkt des Nutzers
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  async handle(handlerInput) {
    clearState(handlerInput);
    //Initialisierte Voice Scanner
     let audioFile = `<audio src='https://api.wuschelcloud.synology.me/voiceScanner/waitingMusic/18s.mp3'/>`;

     voiceScannerClient.init();
    await timeout(5000);
    //callDirectiveService(handlerInput, `v2 Willkommen beim Stimmen Scanner. Ich initialisiere den Scanner. ${audioFile}`);
    

    return handlerInput.responseBuilder
    .speak("5 Sekunden sind um").reprompt("Was möchest du?")
    .getResponse();

    let result = await voiceScannerClient.init();
    if (result.error) {
      let speakOutput = `${result.message} Versuche es erneut.`;
      return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
    } else {
      let speakOutput = `${result.message} Du kannst beispielsweise sagen: "seiteHinzufügen" oder "Hilfe". Möchtest du eine Seite hinzufügen?`;
      setState(handlerInput, "SeiteHinzufuegen")
      return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
    }
  },
};


const AddPageIntentHandler = {
  canHandle(handlerInput) {
    if ((Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest") && (Alexa.getIntentName(handlerInput.requestEnvelope) === "AddPageIntent")) {
      return true;
    }
  //  if ((handlerInput.attributesManager.getSessionAttributes().currentState === "SeiteHinzufuegen") && (Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.YesIntent")) {
  //   return true;
  //  }
  },
  async handle(handlerInput) {
    clearState(handlerInput);

    // let isAbleToScan = await voiceScannerClient.isAbleToScan();
    voiceScannerClient.addPage();

    return handlerInput.responseBuilder
    .speak(JSON.stringify("Scanne..."))
    .reprompt(JSON.stringify("Scanne..."))
    .getResponse(); 

    if (!isAbleToScan) {
      let speakOutput = `Ein Fehler ist aufgetreten. `; //${voiceScannerClient.currentResult?.message ? voiceScannerClient.currentResult.message : "Versuche es erneut."}
      return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse(); 
    }
    
    voiceScannerClient.addPage();
    let audioFile = `<audio src='https://api.wuschelcloud.synology.me/voiceScanner/waitingMusic/30s.mp3'/>`;
    let speakOutput = `Eine Seite wird gescannt. Dies kann bis zu 30 Sekunden dauern. ${audioFile} Möchtest du eine weitere Seite hinzufügen?`;
    setState(handlerInput, "SeiteHinzufuegen");
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("Möchtest du eine weitere Seite hinzufügen?")
      .getResponse();
  },
};



const AllIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" || Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.FallbackIntent"
  );
  },
  async handle(handlerInput) {
    const speakOutput = `Das habe ich nicht verstanden. Du kannst sagen "seiteHinzufügen" oder "Hilfe". Was möchtest du?`;

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .getResponse()
    );
  },
};


//Hilfe
const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      'Mit diesem Skill kannst du durch deine Stimme einscannen und die Datei wird automatisch auf den Server hochgeladen. Wenn du sagst: "seiteHinzufügen", dann beginne ich mit scannen. Was möchtest du?';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
//Stop / Abbrechen
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speakOutput = "Tschau!";

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};
//Nichts verstanden
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet
 * */
const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return false;
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.FallbackIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      'Diesen Befehl kann "Stimmen Scanner" nicht verarbeiten. Falls du Hilfe brauchst, sage "Hilfe"';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "HelloWorldIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = "Hallo Welt!";

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs
 * */
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  async handle(handlerInput) {
    console.log(
      `~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`
    );
    await voiceScannerClient.clear();
    clearState(handlerInput);
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
  },
};

//Test if Intent triggered
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents
 * by defining them above, then also adding them to the request handler chain below
 * */
// const IntentReflectorHandler = {
//   canHandle(handlerInput) {
//     return (
//       Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
//     );
//   },
//   handle(handlerInput) {
//     const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
//     const speakOutput = `You just triggered ${intentName}`;

//     return handlerInput.responseBuilder
//       .speak(speakOutput)
//       .reprompt(
//         "add a reprompt if you want to keep the session open for the user to respond"
//       )
//       .getResponse();
//   },
// };
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below
 * */

async function timeout(ms) {
  return new Promise(async (resolve, reject) => {
    setTimeout(() => resolve(true), ms);
  })
}

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    let jsonString = JSON.stringify(error);
    const speakOutput = `Sorry, I had trouble doing what you asked. Please try again. ${error.message}`;
    console.dir(`~~~~ Error handled: ${error.message} - ${jsonString}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

//My application
const StartIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "StartIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = "Scanner ist bereit. Möchtest du das Scannen beginnen?";
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};


//



const RestartScannerIntent = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "ResetScannerIntent"
    );
  },
  handle(handlerInput) {
    //Scanner resetten
    let speakOutput = "Willst du eine Seite hinzufügen?";
    setQuestion(handlerInput, "DoYouWantToAddAPage");
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

function setState(handlerInput, currentState) {
  const sessionAttributes =
    handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.currentState = currentState;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
}

function clearState(handlerInput) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes.currentState = null;
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
}

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom
 * */


// create a custom skill builder
const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = (event, context, callback) => {
  // we need this so that async stuff will work better
  context.callbackWaitsForEmptyEventLoop = false;

  // set up the skill with the new context
  return skillBuilder
    .addRequestHandlers(
      LaunchRequestHandler,
      HelloWorldIntentHandler,
      HelpIntentHandler,
      CancelAndStopIntentHandler,
      SessionEndedRequestHandler,
      AddPageIntentHandler,
      AllIntentHandler
    ).withApiClient(new Alexa.DefaultApiClient())
    .addErrorHandlers(ErrorHandler)
    .withCustomUserAgent("jonas/voice-scanner/v1.0")
    .lambda()(event, context, callback);
}

//  exports.handler = function(event, context, callback) {
//   context.callbackWaitsForEmptyEventLoop = false;
//  }
 

// exports.handler = Alexa.SkillBuilders.custom()
//   .addRequestHandlers(
//     LaunchRequestHandler,
//     HelloWorldIntentHandler,
//     HelpIntentHandler,
//     CancelAndStopIntentHandler,
//     SessionEndedRequestHandler,
//     AddPageIntentHandler,
//     AllIntentHandler
//   )
//   .addErrorHandlers(ErrorHandler)
//   .withCustomUserAgent("jonas/voice-scanner/v1.0")
//   .lambda();

