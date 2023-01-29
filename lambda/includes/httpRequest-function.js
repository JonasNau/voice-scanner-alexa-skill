const axios = require('axios').default;
const objectFunctions = require("./object-functions");
const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiIzIiwidXVpZCI6ImM2OGNlZmJjLTIzNjQtNDhhYi1hMzkwLWFkNjcwY2E2ZWJmZCIsInVzZXJuYW1lIjoiSm9uYXMiLCJwYXNzd29yZCI6IiQyYSQxMCRwL0NIY3gyN1U1WjhpNEQ2M3l6bkVlaGc5Rno3Z0xiTjVHTzJuWFExODRLejVNbWFja0Y4VyIsImNyZWF0ZWQiOiJGcmkgQXVnIDE5IDIwMjIgMjA6MzY6NDEgR01UKzAyMDAgKE1pdHRlbGV1cm9ww6Rpc2NoZSBTb21tZXJ6ZWl0KSIsImxhc3RMb2dpbiI6bnVsbCwibGFzdFB3ZENoYW5nZSI6bnVsbCwiZ3JvdXBzIjpbImFkbWluIl0sInBlcm1pc3Npb25zIjp7fSwiaXNGb3JiaWRkZW5UbyI6W10sImV4cGlyZXMiOiJuZXZlciIsImlhdCI6MTY2MTE2ODQwMH0.lLARdA-oRfDlNzNS1wlhvAOQgLXPj1Mxyj333g9tXjM";

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
  
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        const instance = axios.create({
          baseURL: 'https://api1.jonas-pc-doctor.com/api/voiceScanner',
          timeout: 0,
          headers: {'auth-token': authToken},
          rejectUnauthorized: false
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
         
        }).catch(error => console.error(error));
            
      })
  }


module.exports = {
    httpRequest
}