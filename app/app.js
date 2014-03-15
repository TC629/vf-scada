/**
 * Module dependencies.
 */
var express = require("express");
var minify = require("express-minify");
var routes = require("./routes");
var http = require("http");
var path = require("path");
var cons = require("consolidate");
var five = require("johnny-five");
var socketio = require("socket.io");
var Station = require("./lib/stations");

// Global variables
var app,
  io,
  board,
  active = false,
  startTime,
  stopTime,
  reference,
  product,
  stations = Array(5);

// Setup

// Web server setup
app = express();

app.engine("hbs", cons.handlebars);
// change to 80 when deploying in pcDuino
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.logger("dev"));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.compress());
app.use(minify({
    js_match: /javascript/,
    css_match: /css/,
    sass_match: /scss/,
    less_match: /less/,
    stylus_match: /stylus/,
    coffee_match: /coffeescript/,
    cache: false,
    blacklist: [/\.min\.(css|js)$/],
    whitelist: null
}));
app.use(express.static(path.join(__dirname, "static")));

// development only
if ("development" == app.get("env")) {
  app.use(express.errorHandler());
}

app.get("/", routes.index);

http.createServer(app).listen(app.get("port"), function(){
  console.log("HTTP server listening on port " + app.get("port"));
});

// Event server setup
resetStations();

// Registers handlers for physical sensors.
// Data collection must be done here.
board = new five.Board();

board.on("ready", function() {
  s1 = new five.Button(2);
  s2 = new five.Button(3);
  s3 = new five.Button(4);
  s4 = new five.Button(5);
 
  s1.on("down", function() {
    if(active) {
      stations[0].enqueue();
      stations[1].enqueue();
      board.emit("s1_on");
    }
  }).on("up", function() {
    if(active) {
      board.emit("s1_off");
    }
  });

  s2.on("down", function() {
    if(active) {
      stations[1].dequeue();
      stations[2].enqueue();
      board.emit("s2_on");
    }
  }).on("up", function() {
    if(active) {
      board.emit("s2_off");
    }
  });

  s3.on("down", function() {
    if(active) {
      stations[2].dequeue();
      stations[3].enqueue();
      board.emit("s3_on");
    }
  }).on("up", function() {
    if(active) {
      board.emit("s3_off");
    }
  });

  s4.on("down", function() {
    if(active) {
      stations[3].dequeue();
      stations[0].dequeue();
      board.emit("s4_on");
    }
  }).on("up", function() {
    if(active) {
      board.emit("s4_off");
    }
  });

});

// Websocket setup
io = socketio.listen(8080);

// Registers handler for client connections. 
io.sockets.on("connection", function (socket) {
  processConnection(socket);
  handleBoardEvents(socket);
  handleClientEvents(socket);
  handleClientDisconnection(socket);
});

// TODO: Move to module in ./lib
// Processes a new client connection.
function processConnection(socket) {
  // Puts client in pool so that it can broadcast messages to peers.
  socket.join("clients");
  var connectedClients = io.sockets.clients("clients").length;
  socket.emit("clients", {"clients": connectedClients});
  socket.broadcast.to("clients").emit("clients", {"clients": connectedClients});
  // Syncronizes client's state.
  socket.emit("sync", {
    "active": active,
    "startTime": startTime,
    "reference": reference,
    "product": product,
    "stations":stationStats(),
  });
}

// Processes a client disconnection.
function handleClientDisconnection(socket) {
  socket.on("disconnect", function() {
    var connectedClients = io.sockets.clients("clients").length - 1;
    socket.broadcast.to("clients").emit("clients", {"clients": connectedClients});
  });
}

// Registers event handlers for control board events.
// i.e when a pushbutton is pressed
function handleBoardEvents(socket) {
  board.on("s1_on", function(){
    socket.emit("s1_on", stationStats());
  });

  board.on("s1_off", function(){
    socket.emit("s1_off");
  });

  board.on("s2_on", function(){
    socket.emit("s2_on", stationStats());
  });

  board.on("s2_off", function(){
    socket.emit("s2_off");
  });

  board.on("s3_on", function(){
    socket.emit("s3_on", stationStats());
  });

  board.on("s3_off", function(){
    socket.emit("s3_off");
  });

  board.on("s4_on", function(){
    socket.emit("s4_on", stationStats());
  });

  board.on("s4_off", function(){
    socket.emit("s4_off");
  });

  board.on("s5_on", function(){
    socket.emit("s4_on", stationStats());
  });

  board.on("s5_off", function(){
    socket.emit("s5_off");
  });
}

// Registers event handlers for client events.
// i.e. when a user presses Start button
function handleClientEvents(socket) {
    socket.on("start", function(data) {
      processStart(socket, data);
    });

    socket.on("stop", function(data) {
      processStop(socket, data);
    });
}

function processStart(socket, data) {
  if(!active) {
    active = true;
    startTime = data.startTime = Date.now();
    reference = data.reference;
    product = data.product;
    for(var i = 0; i < stations.length; ++i) {
      stations[i].operator = data.operators[i];
    }
    data.stations = stationStats();
    socket.emit("start", data);
    socket.broadcast.to("clients").emit("start", data);
  }
}

function processStop(socket, data) {
  if(active) {
    stopTime = Date.now();
    active = false;
    socket.broadcast.to("clients").emit("stop");
    var report = {
      duration: elapsedTime(startTime, stopTime),
      product: product,
      reference: reference,
      stations: stationStats(),
    };
    socket.emit("report", report);
    socket.broadcast.to("clients").emit("report", report);
    resetStations();
  }
}

// Resets stations data.
function resetStations() {
  for(var i = 0; i < stations.length; ++i) {
    stations[i] = new Station();
  }
}

// Returns list of station statistics.
function stationStats() {
  var stats = new Array(stations.length);
  for(var i = 0; i < stations.length; ++i) {
    stats[i] = stations[i].stats;
    stats[i].operator = stations[i].operator;
  }
  return stats;
}

// Computes elapsed time in hours, minutes, and seconds.
function elapsedTime(start, end) {
    start = new Date(start);
    end = new Date(end);

    var timeDiff = end - start,
      seconds, minutes, hours; 

    timeDiff = Math.floor(timeDiff / 1000);
    seconds = Math.round(timeDiff % 60);

    timeDiff = Math.floor(timeDiff / 60);
    minutes = Math.round(timeDiff % 60);

    timeDiff = Math.floor(timeDiff / 60);
    hours = Math.round(timeDiff % 24);
    
    return {hours:hours, minutes:minutes, seconds:seconds};
}
