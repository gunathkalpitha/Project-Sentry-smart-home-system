const wifi = require('node-wifi');

wifi.init({ iface: null }); // auto-detect interface

async function scanNetworks() {
  return new Promise((resolve, reject) => {
    wifi.scan((err, networks) => {
      if (err) return reject(err);
      resolve(networks);
    });
  });
}

async function connectToNetwork(ssid, password) {
  return new Promise((resolve, reject) => {
    wifi.connect({ ssid, password }, err => {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = { scanNetworks, connectToNetwork };