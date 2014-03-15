var os = require('os'),
  ip = exports;

// See: http://stackoverflow.com/questions/10750303/how-can-i-get-the-local-ip-address-in-node-js
ip.networkAddresses  = function networkAddresses() {
  var interfaces = os.networkInterfaces();
  var addresses = [];
  for(k in interfaces) {
    for(k2 in interfaces[k]) {
      var address = interfaces[k][k2];
      if(address.family == 'IPv4' && !address.internal) {
        addresses.push(address.address)
      }
    }
  }
  return addresses;
}

ip.networkAddress = function networkAddress() {
  return ip.networkAddresses()[0];
}
