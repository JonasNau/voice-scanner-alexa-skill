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
     //let audioFile = `<audio src='https://api.wuschelcloud.synology.me/voiceScanner/waitingMusic/18s.mp3'/>`;
     callDirectiveService(handlerInput, `v2 Willkommen beim Stimmen Scanner. Ich initialisiere den Scanner.`);
    
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
   if ((handlerInput.attributesManager.getSessionAttributes().currentState === "SeiteHinzufuegen") && (Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.YesIntent")) {
    return true;
   }
  },
  async handle(handlerInput) {
    clearState(handlerInput);

    let result = await voiceScannerClient.addPageAsync();
    if (result.error) {
      let speakOutput = `${result.message} Versuche es erneut.`;
      return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
    } else {
      let audioFile = `<audio src='https://api.wuschelcloud.synology.me/voiceScanner/waitingMusic/30s.mp3'/>`;
      let speakOutput = `Eine Seite wird gescannt. Dies kann bis zu 30 Sekunden dauern. ${audioFile} Möchtest du eine weitere Seite hinzufügen?`; 
      setState(handlerInput, "SeiteHinzufuegen")
      return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("Möchtest du eine weitere Seite hinzufügen?")
      .getResponse();
    }
  },
};


const SavePagesIntentHandler = {
  canHandle(handlerInput) {
    if ((Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest") && (Alexa.getIntentName(handlerInput.requestEnvelope) === "SavePagesIntent") && Alexa.getDialogState(handlerInput.requestEnvelope) === "COMPLETED") {
      return true;
    }
  },
  async handle(handlerInput) {
    clearState(handlerInput);

    const filename = Alexa.getSlotValue(handlerInput.requestEnvelope, "dateiname");
    const extension = Alexa.getSlotValue(handlerInput.requestEnvelope, "dateierweiterung");

    let result = await voiceScannerClient.convertAndUploadAsync(filename, extension);
    if (result.error) {
      let speakOutput = `${result.message} Versuche es erneut.`;
      return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
    } else {
      //let audioFile = `<audio src='https://api.wuschelcloud.synology.me/voiceScanner/waitingMusic/18s.mp3'/>`;
      let speakOutput = `Die Dateien wurden erfolgreich auf den Server bei Dateien/Dokumente/Scans/VoiceScanner hochgeladen. Wenn du noch ein Dokument einscannen möchtest, dann sage "starte stimmen scanner"`; 
      return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
    }
  },
};



 const AddPageNoIntentHandler = {
  canHandle(handlerInput) {
      if ((handlerInput.attributesManager.getSessionAttributes().currentState === "SeiteHinzufuegen") && (Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.NoIntent")) {
        return true;
       }
       return false;
  },
  async handle(handlerInput) {
    clearState(handlerInput);
    const speakOutput = `Wenn du keine weitere Seite hinzufügen möchtest, sage "speichern". Wenn du doch noch eine Seite hinzufügen möchtest, sage "Seite hinzufügen"`;
    setState(handlerInput, "SeiteHinzufuegen")
    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .getResponse()
    );
  },
};



const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" || Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.FallbackIntent"
  );
  },
  async handle(handlerInput) {
    clearState(handlerInput);
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
    clearState(handlerInput);
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
  async handle(handlerInput) {
    clearState(handlerInput);
    await voiceScannerClient.clear();
    const speakOutput = "Tschau!";

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
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
  //context.callbackWaitsForEmptyEventLoop = false;

  // set up the skill with the new context
  return skillBuilder
    .addRequestHandlers(
      LaunchRequestHandler,
      HelloWorldIntentHandler,
      HelpIntentHandler,
      CancelAndStopIntentHandler,
      SessionEndedRequestHandler,
      AddPageIntentHandler,
      SavePagesIntentHandler,
      AddPageNoIntentHandler,
      FallbackIntentHandler
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

