const axios = require('axios').default;
const objectFunctions = require("./object-functions");

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


module.exports = {
    httpRequest
}