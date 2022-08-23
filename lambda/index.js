/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require("ask-sdk-core");

//Custom Modules
const axios = require('axios').default;
const objectFunctions = require("./includes/object-functions");

const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiIzIiwidXVpZCI6ImM2OGNlZmJjLTIzNjQtNDhhYi1hMzkwLWFkNjcwY2E2ZWJmZCIsInVzZXJuYW1lIjoiSm9uYXMiLCJwYXNzd29yZCI6IiQyYSQxMCRwL0NIY3gyN1U1WjhpNEQ2M3l6bkVlaGc5Rno3Z0xiTjVHTzJuWFExODRLejVNbWFja0Y4VyIsImNyZWF0ZWQiOiJGcmkgQXVnIDE5IDIwMjIgMjA6MzY6NDEgR01UKzAyMDAgKE1pdHRlbGV1cm9ww6Rpc2NoZSBTb21tZXJ6ZWl0KSIsImxhc3RMb2dpbiI6bnVsbCwibGFzdFB3ZENoYW5nZSI6bnVsbCwiZ3JvdXBzIjpbImFkbWluIl0sInBlcm1pc3Npb25zIjp7fSwiaXNGb3JiaWRkZW5UbyI6W10sImV4cGlyZXMiOiJuZXZlciIsImlhdCI6MTY2MTE2ODQwMH0.lLARdA-oRfDlNzNS1wlhvAOQgLXPj1Mxyj333g9tXjM";

class VoiceScannerClient {
  constructor() {
    this.isScanning = false;
  }

  async init() {
    let dataToSend = {filename: "Dateiname", extension: "pdf"};
    let dataString = JSON.stringify(dataToSend);
    let response = await httpRequest({
      url: "/init",
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(dataString),
      },
      timeout: 0, //Some requests recieve only after the scanner is done -> 20 Seconds should be enough
      body: false,
      params: false, //For Get Request
      data: dataString
     });
    
    if (response === false) {
      return {error: true, message: "Ein Fehler ist aufgetreten. Bitte versuche es erneut."};
    }
    if (response.error) {
      return {error: true, message: response.message}
    }

    return {error: false, message: response.message};
  }

  clear() {

  }

  addPage() {

  }

  convertAndUpload() {

  }

  kill() {

  }

  numberOfPages() {

  }

}

const voiceScannerClient = new VoiceScannerClient();

async function httpRequest(
  options = {
    url: "/init",
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": 0,
    },
    timeout: 0, //Some requests recieve only after the scanner is done -> 20 Seconds should be enough
    body: false,
    params: false, //For Get Request
    data: JSON.stringify("{'username': 'test', 'password': 'sjfösdjflsdakjföads'}")
}) {
    return new Promise(async (resolve, reject) => {

    
      const instance = axios.create({
        baseURL: 'http://wuschelcloud.synology.me:3000/api/voiceScanner',
        timeout: 0,
        headers: {'auth-token': authToken},
      });

      instance.request(options).then((response) => {
        //data, status, statusText, headers, config, request
        if (response.status > 399) {
          console.error(response)
          resolve({error: true, message: "Ein interner Fehler ist aufgetreten. Versuche es erneut."});
          return;
        }
        if (objectFunctions.makeJSON(response.data)) {
          let data = objectFunctions.makeJSON(response.data);
          if (data.error == true) {resolve({error: true, message: data.message}); return;};
          resolve(data);
          return;
        } else {
          resolve({error: true, message: "Rückgabewert ist kein gültiges JSON. Versuche es erneut."});
        }
       
      })
          
    })
}
  
//Eintrittspunkt des Nutzers
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  async handle(handlerInput) {

    // let result = await voiceScannerClient.init();

    // const speakOutput = result.message;

    const speakOutput = 'Willkommen beim Stimmen Scanner. Du kannst beispielsweise sagen: "starte Scanner" oder "Hilfe". Was möchtest du?';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};




const AllIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" && Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.FallbackIntent"
  );
  },
  async handle(handlerInput) {
  //  let result = await voiceScannerClient.init();

    const speakOutput = "Test";//result.message;

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(result.message)
        .getResponse()
    );
  },
};


const FallbackIntent = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" || Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.FallbackIntent"
  );
  },
  async handle(handlerInput) {
  //  let result = await voiceScannerClient.init();

    const speakOutput = "Test";//result.message;

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(result.message)
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
      'Mit diesem Skill kannst du durch deine Stimme einscannen und die Datei wird automatisch auf den Server hochgeladen. Wenn du sagst: "starte Scanner", dann beginne ich mit scannen';

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
  handle(handlerInput) {
    console.log(
      `~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`
    );
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
const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
    );
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(
        "add a reprompt if you want to keep the session open for the user to respond"
      )
      .getResponse();
  },
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below
 * */
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

const AddPageIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AddPageIntent"
    );
  },
  handle(handlerInput) {
    //scannen
    let speakOutput = "Okay, eine Seite wird hinzugefügt.";
    setQuestion(handlerInput, "DoYouWantToAddAPage");
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

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

function setState(handlerInput, state) {
  const sessionAttributes =
    handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes.questionAsked = questionAsked;
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
}

function clearQuestion(handlerInput) {
  const sessionAttributes =
    handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes.questionAsked = null;
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
}

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom
 * */
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    AddPageIntentHandler,
    IntentReflectorHandler,
    AllIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent("jonas/voice-scanner/v1.0")
  .lambda();
