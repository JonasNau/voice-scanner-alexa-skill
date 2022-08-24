const objectFunctions = require("./object-functions");
const { httpRequest } = require("./httpRequest-function");

const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiIzIiwidXVpZCI6ImM2OGNlZmJjLTIzNjQtNDhhYi1hMzkwLWFkNjcwY2E2ZWJmZCIsInVzZXJuYW1lIjoiSm9uYXMiLCJwYXNzd29yZCI6IiQyYSQxMCRwL0NIY3gyN1U1WjhpNEQ2M3l6bkVlaGc5Rno3Z0xiTjVHTzJuWFExODRLejVNbWFja0Y4VyIsImNyZWF0ZWQiOiJGcmkgQXVnIDE5IDIwMjIgMjA6MzY6NDEgR01UKzAyMDAgKE1pdHRlbGV1cm9ww6Rpc2NoZSBTb21tZXJ6ZWl0KSIsImxhc3RMb2dpbiI6bnVsbCwibGFzdFB3ZENoYW5nZSI6bnVsbCwiZ3JvdXBzIjpbImFkbWluIl0sInBlcm1pc3Npb25zIjp7fSwiaXNGb3JiaWRkZW5UbyI6W10sImV4cGlyZXMiOiJuZXZlciIsImlhdCI6MTY2MTE2ODQwMH0.lLARdA-oRfDlNzNS1wlhvAOQgLXPj1Mxyj333g9tXjM";

class VoiceScannerClient {
  constructor() {
    this.currentResult = false;
    this.filename = "";
    this.extension = "";
    this.status = false;
  }

  async init() {
    return new Promise(async (resolve, reject) => {
      let response = await httpRequest({
        url: "/init",
        method: "post",
        timeout: 0, //Some requests recieve only after the scanner is done -> 20 Seconds should be enough
        body: false,
        params: false, //For Get Request
      });

      if (response === false) {
        this.currentResult = {
          error: true,
          message: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
        };
        resolve({
          error: true,
          message: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
        });
        return;
      }
      if (response.error) {
        this.currentResult = { error: true, message: response.message };
        resolve({ error: true, message: response.message });
        return;
      }

      this.currentResult = { error: false, message: response.message };
      resolve({ error: false, message: response.message });
      return;
    });
  }

  async clear() {
    return new Promise(async (resolve, reject) => {
      let response = await httpRequest({
        url: "/clear",
        method: "post",
        timeout: 5000, //Some requests recieve only after the scanner is done -> 20 Seconds should be enough
        body: false,
        params: false, //For Get Request
      });

      if (response === false) {
        this.currentResult = {
          error: true,
          message: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
        };
        resolve({
          error: true,
          message: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
        });
        return;
      }
      if (response.error) {
        this.currentResult = { error: true, message: response.message };
        resolve({ error: true, message: response.message });
        return;
      }

      this.currentResult = { error: false, message: response.message };
      resolve({ error: false, message: response.message });
      return;
    });
  }

  async addPage() {
    return new Promise(async (resolve, reject) => {
      let response = await httpRequest({
        url: "/addPage",
        method: "post",
        timeout: 30000, //Some requests recieve only after the scanner is done -> 20 Seconds should be enough
        body: false,
        params: false, //For Get Request
      });

      if (response === false) {
        this.currentResult = {
          error: true,
          message: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
        };
        resolve({
          error: true,
          message: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
        });
        return;
      }
      if (response.error) {
        this.currentResult = { error: true, message: response.message };
        resolve({ error: true, message: response.message });
        return;
      }

      this.currentResult = { error: false, message: response.message };
      resolve({ error: false, message: response.message });
      return;
    });
  }

  async convertAndUpload(filename, extension) {
    return new Promise(async (resolve, reject) => {
      let dataToSend = { filename: filename, extension: extension };
      let dataString = JSON.stringify(dataToSend);
      let response = await httpRequest({
        url: "/convertAndUpload",
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(dataString),
        },
        timeout: 0, //Some requests recieve only after the scanner is done -> 20 Seconds should be enough
        body: false,
        params: false, //For Get Request
        data: dataString,
      });

      if (response === false) {
        this.currentResult = {
          error: true,
          message: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
        };
        resolve({
          error: true,
          message: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
        });
        return;
      }
      if (response.error) {
        this.currentResult = { error: true, message: response.message };
        resolve({ error: true, message: response.message });
        return;
      }

      this.currentResult = { error: false, message: response.message };
      resolve({ error: false, message: response.message });
      return;
    });
  }

  async kill() {
    return new Promise(async (resolve, reject) => {
      let response = await httpRequest({
        url: "/kill",
        method: "post",
        timeout: 5000, //Some requests recieve only after the scanner is done -> 20 Seconds should be enough
        body: false,
        params: false, //For Get Request
      });

      if (response === false) {
        this.currentResult = {
          error: true,
          message: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
        };
        resolve({
          error: true,
          message: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
        });
      }
      if (response.error) {
        this.currentResult = { error: true, message: response.message };
        resolve({ error: true, message: response.message });
      }

      this.currentResult = { error: false, message: response.message };
      resolve({ error: false, message: response.message });
    });
  }

  async getNumberOfPages() {
    await this.updateStatus();
    if (!this.status) return 0;
    return this.status.numberOfPages;
  }

  async updateStatus() {
    return new Promise(async (resolve, reject) => {
      let response = await httpRequest({
        url: "/status",
        method: "post",
        timeout: 0, //Some requests recieve only after the scanner is done -> 20 Seconds should be enough
        body: false,
        params: false, //For Get Request
      });

      if (response === false) {
        this.status = false;
        resolve(true);
        return;
      }
      this.status = response;
      resolve(true);
    });
  }

  async canConvertAndUploadFiles() {
    await this.updateStatus();
    if (!this.status) return false;
    if (!this.status.numberOfPages > 0) return false;
    return true;
  }

  async isAbleToScan() {
    return new Promise(async (resolve, reject) => {
      await this.updateStatus();
      if (!this.status) {
        resolve(false);
        return;
      }
      /* if (this.status.isScanning != false) {resolve(false); return}; */
      if (this.status.currentState === "initialized") {
        resolve(true);
        return;
      }
      if (this.status.currentState === "ready") {
        resolve(true);
        return;
      }
      resolve(false);
    });
  }
}
const voiceScannerClient = new VoiceScannerClient();

module.exports = { voiceScannerClient };
