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
const Util = require("./util");
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
     callDirectiveService(handlerInput, `Willkommen beim Stimmen Scanner. Ich initialisiere den Scanner.`);
    
    let result = await voiceScannerClient.init();
    if (result.error) {
      let speakOutput = `${result.message} Versuche es erneut.`;
      return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
    } else {
      let speakOutput = `${result.message} Du kannst beispielsweise sagen: "seiteHinzufügen" oder "Hilfe". Möchtest du eine Seite hinzufügen?`;
      setState(handlerInput, "SeiteHinzufuegen");
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
      let audioFile = `<audio src="${String("https://dcbb5727-7e3c-40e8-9df9-9fa8c337e14c-us-east-1.s3.us-east-1.amazonaws.com/Media/30s.mp3?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEL%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIAkfbtLIuJAK40fxvZFhN5jyjmGdPWb1FtWydqqS0PiGAiEA90496r2xOPLhbxKgE7juqIt3WaYKgz%2B1biwK04GYskYq4wIIRxAAGgw3MzcyMzgxNDU4MjAiDDPTY49jkqQOVFCHdSrAAhxtQt%2BjJ%2Fvz0CPQseITrNWOU%2BWy1NZREkI0Qg67lMW1LI1F5hr5mUIphTSPZsCEeDy9wkUEDNWYvKQa5Ry8IeqehbPnBR5FCX5NC%2FarDUpHGjy5wLS5J%2F2pVlUm%2F39naVdmjr2dJwv4EDzZtZ5kGt%2Bwfw%2FtL3JrFxqvX1mHNgOM7yZ1c43hAtlkWa3%2F6L34XeQJ%2BGdsdLcsUiA4ilD%2FbL6%2F%2FWWlkyNj%2FFifceOjGpAgSPkK0YBRRN%2BuUcZGlMMRDs0DJJRyX1Gnk9zzTvJjmnF5w9UC0RT3CGc8%2FuujqqnVyElPGJy%2FVhc2GErnYBPG1kC3fhhimFWYd8jOn8aRqM0uPaJBS7VfjKlUm%2B%2FUhqx1wbaOw3wo1oUDEVwLOk575t%2Fwo1Djk%2Fv%2Fza6EthGMJ%2FXECJywOk2wRNArqiNG51UcMPSxuJgGOocCPgWBPLN%2FvfWo77SO44pIVJQQvWYrR80qdHC59S91dY1tsCx%2BqEjx4fheic%2F6zz3dpPMUU8bUJCL858xhnUfPGCns4vDbZdo0khcComYaTxGoD3T6YZTidbcxJywRQBq3kGN%2FV3z%2FDcStkQkODCmV8yRwxsSB0T1NJCSo17Av31%2BZFp8ZXcnpCaBfGvvhwOdSgsCtHRYvoswqrITktx8MqYZbX31J5VDI2UBWm%2FOKJ7O86ovJxxFPna830DjNcHNEQrflaRE2rprMoH930%2FzB5LF4Ya4IEcBEwMcb%2FDT%2BrYbaJJ294rayJ0Gyc0neVyh4L4p7DlEkFeKgQkd37XZWUXovxvN5sPE%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220830T140459Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIA2XJWRLMOPFGLDJ4N%2F20220830%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=9818ff6f16d0964e53e4d8c0fe89e3e42f56d4e231eebe0f6cbdf24402331276").replace("&", "&amp;")}"/>`;
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

    const recognizeExtension = ((extension) => {
      if (!extension) return "pdf";
      let checkString = extension.replace(".", "").replace(" ", "");
      let checkArray = checkString.split("");

      const extensions = {
        "pdf": [["p", "d"]],
        "png": [["p", "n"]],
        "jpg": [["j", "p"]]
      }
     for (const [ext, possibleChars] of Object.entries(extensions)) {
        if (possibleChars.every(currentChar => {return checkArray.includes(currentChar);})) return ext;
     }
      return "pdf";
    })

    const filename = Alexa.getSlotValue(handlerInput.requestEnvelope, "dateiname");
    let extension = recognizeExtension(Alexa.getSlotValue(handlerInput.requestEnvelope, "dateierweiterung"));
    
    

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


const RestartIntentHandler = {
  canHandle(handlerInput) {
    if ((Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest") && (Alexa.getIntentName(handlerInput.requestEnvelope) === "RestartIntent")) {
      return true;
    }
    return false;
  },
  async handle(handlerInput) {
    clearState(handlerInput);

    let result = await voiceScannerClient.clear();
    if (result.error) {
      let speakOutput = `${result.message} Versuche es erneut.`;
      return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
    } else {
      let speakOutput = result.message; 
      return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("Möchtest du eine weitere Seite hinzufügen?")
      .getResponse();
    }
  },
};

const StatusIntentHandler = {
  canHandle(handlerInput) {
    if ((Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest") && (Alexa.getIntentName(handlerInput.requestEnvelope) === "StatusIntent")) {
      return true;
    }
    return false;
  },
  async handle(handlerInput) {
    clearState(handlerInput);

    let result = await voiceScannerClient.getNumberOfPages();
    if (result === false) {
      let speakOutput = `Konnte die Anzahl der Seiten nicht ermitteln. Versuche es erneut.`;
      return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
    } else {
      let speakOutput = `Bisher hast du  <say-as interpret-as="digits">${parseInt(result)}</say-as> Seiten gescannt.`
      return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("Möchtest du eine weitere Seite hinzufügen?")
      .getResponse();
    }
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
    const reason = handlerInput.requestEnvelope.request.reason;
    console.log("==== SESSION ENDED WITH REASON ======");
    console.log(reason); 

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
    console.log("===== ERROR =====")
    console.log(error);
    console.log(`~~~~ Error handled: ${error.message} - ${jsonString}`);
    const speakOutput = `Sorry, I had trouble doing what you asked. Please try again. ${error.message}`;
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
 * Request Interceptor to log the request sent by Alexa
 */
 const LogRequestInterceptor = {
  process(handlerInput) {
    // Log Request
    console.log("==== REQUEST ======");
    console.log(JSON.stringify(handlerInput.requestEnvelope, null, 2));
  }
}
/**
 * Response Interceptor to log the response made to Alexa
 */
const LogResponseInterceptor = {
  process(handlerInput, response) {
    // Log Response
    console.log("==== RESPONSE ======");
    console.log(JSON.stringify(response, null, 2));
  }
}



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
      RestartIntentHandler,
      StatusIntentHandler,
      FallbackIntentHandler
    ).withApiClient(new Alexa.DefaultApiClient())
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(LogRequestInterceptor)
    .addResponseInterceptors(LogResponseInterceptor)
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

