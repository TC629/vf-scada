var ip = require('../lib/ip');

/*
 * GET dashboard page.
 */

exports.index = function(req, res){
  // Get correct host for socket.io
  var remoteAddress = req._remoteAddress;
  var networkAddress = remoteAddress;
  if(remoteAddress != "127.0.0.1") {
    networkAddress = ip.networkAddress();
  }
  res.render('index', { ip: networkAddress, port:8080 });
};
