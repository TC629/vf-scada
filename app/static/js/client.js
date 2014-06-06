var socket,
  svg,
  s1,
  s2,
  s3,
  startTime,
  updateTimerID,
  report;

function initialize(host, port) {

  // Initialize connection to server. 
  socket = io.connect("//"+host, {port: port}),

  // Register server event handlers.

  socket.on("s1_on", function(stations){
    s1.animate({fill:"#00ff00"}, 100);
    updateStations(stations);
  });

  socket.on("s1_off", function(){
    s1.animate({fill:"#dcdcdc"}, 100);
  });

  socket.on("s2_on", function(stations){
    s2.animate({fill:"#00ff00"}, 100);
    updateStations(stations);
  });

  socket.on("s2_off", function(){
      s2.animate({fill:"#dcdcdc"}, 100);
  });

  socket.on("s3_on", function(stations){
    s3.animate({fill:"#00ff00"}, 100);
    updateStations(stations);
  });

  socket.on("s3_off", function(data){
      s3.animate({fill:"#dcdcdc"}, 100);
  });

  socket.on("s4_on", function(stations){
    s4.animate({fill:"#00ff00"}, 100);
    updateStations(stations);
  });

  socket.on("s4_off", function(data){
      s4.animate({fill:"#dcdcdc"}, 100);
  });

  socket.on("sync", function(data) {
    if(data.active) {
      processStart(data);
    }
  });

  socket.on("clients", function(data) {
    $("#clients").text(data.clients);
  });

  socket.on("start", function(data) {
    processStart(data);
  });

  socket.on("stop", function(data) {
    processStop(data);
  });

  socket.on("report", function(data) {
    processReport(data);
  });
    
  socket.on("message", function(message) {
    showMessage(message);
  });

  // Register UI event handlers.

  $("#start").click(clickStart);
  $("#stop").click(clickStop);

  // Loads the SCADA SVG diagram.
  svg = Snap("#canvas");
  Snap.load("/img/planta.svg", function(f) {

      // Register objects for animation.
      s1 = f.select("#sensor1");
      s2 = f.select("#sensor2");
      s3 = f.select("#sensor3");
      s4 = f.select("#sensor4");

      // Add image to canvas.
      svg.append(f);
  });

  // Compile Handlebars report template
  $.get("/hbs/report.hbs", function(content) {
    report = Handlebars.compile(content);
  });
  //report = Handlebars.compile($("#report-template").html()); 
}

// Validates input
function validateInput(data) {
  // FIXME
  return true; 
}

// Sends start signal and data to the server.
function clickStart() {
  var data = {
    reference: $("#reference").val(),
    product: $("#product").val(),
    operators: [
      null,
      $("#operator0").val(),
      $("#operator1").val(),
      $("#operator2").val(),
      $("#operator3").val()]
  };

  if(validateInput(data)) {
    socket.emit("start", data);
  }
}

// Updates UI with start data.
function processStart(data) {
  console.log(data);
  // Start ticking timer
  updateTimerID = setInterval(function() { updateTimer(data.startTime); }, 1000);
  // Update control panel UI
  $("#form >> input").attr("disabled", "disabled");
  $("#start").attr("disabled", "disabled")
             .removeClass("btn-success")
             .addClass("btn-primary");
  $("#stop").removeAttr("disabled");
  $("#reference").val(data.reference);
  $("#product").val(data.product);
  for(var i = 1; i < data.stations.length; ++i) {
    $("#operator"+(i-1)).val(data.stations[i].operator);
  }
  $("#canvas").removeClass("hidden").addClass("show");
  $("#report").removeClass("show").addClass("hidden");
  // Update stations UI
  updateStations(data.stations);
}

// Sends stop signal to server.
function clickStop() {
  socket.emit("stop", {"stopTime": Date.now()});
  processStop();
}

// Updates UI with stop data.
function processStop(data) {
  resetStations();
  clearInterval(updateTimerID);
  $("#form >> input").removeAttr("disabled").val("");
  $("#stop").attr("disabled", "disabled");
  $("#start").removeAttr("disabled")
             .removeClass("btn-primary")
             .addClass("btn-success")
             .text("Iniciar");
}

// Renders report template with incoming data.
function processReport(data) {
    $("#report").removeClass("hidden").addClass("show");
    $("#canvas").removeClass("show").addClass("hidden");
    $("#report").html(report(data));
}

// Starts stop watch timer with a predefined start time.
function updateTimer(startTime) {
    et = elapsedTime(startTime, Date.now());
    $("#start").text(et.hours+":"+et.minutes+":"+et.seconds);
}

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

function resetStations() {
  for(var i = 0; i < 5; ++i) {
    $("#station"+i+"_in").text(0); 
    $("#station"+i+"_out").text(0); 
    $("#station"+i+"_speed").text(0); 
  }
}

function updateStations(stations) {
  for(var i = 0; i < stations.length; ++i) {
    $("#station"+i+"_in").text(stations[i].in); 
    $("#station"+i+"_out").text(stations[i].out); 
    $("#station"+i+"_speed").text(stations[i].speed); 
  }
}

function showMessage(message) {
    $("#message-title").text(message.title);
    $("#message-body").text(message.body);
    $("#message").modal({show:true});
}
