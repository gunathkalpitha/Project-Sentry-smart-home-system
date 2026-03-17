const wifi = require('node-wifi');

wifi.init({ iface: null }); // auto-detect interface

wifi.scan((err, networks) => {
  if (err) {
    console.error('WiFi scan error:', err);
    process.exit(1);
  }
  console.log('Available networks:', networks);
  process.exit(0);
});
