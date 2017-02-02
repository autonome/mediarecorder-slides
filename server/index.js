/* globals require */
"use strict";

const httpPort = 8000;
const ws = require("ws");
const wsPort = 8009;
const express = require("express");

(() => {

  // Data
  var data = {
    clients: 0,
    userAgents: {}
  };

  // Web server
  var app = new express();
  
  // Web socket server
  var wss = new ws.Server({ port: wsPort, clientTracking: true });

	// Implement broadcast
	wss.broadcast = function broadcast(data) {
  	wss.clients.forEach(function each(client) {
    	if (client.readyState === client.OPEN) {
      	client.send(data);
    	}
  	});
	};

  wss.on('connection', function(conn) {
    data.clients++;
    wss.broadcast(JSON.stringify(data));
  });

  // Upon each new connection, broadcast data to all clients
  app.use(function(req, res, next) {
    if (req.url == '/') {
      var ua = req.headers['user-agent'];
      if (data.userAgents[ua]) {
        data.userAgents[ua]++;
      }
      else {
        data.userAgents[ua] = 1;
      }
    }
    next();
  });

  // Register static dir
  app.use('/', express.static('../'));

  app.listen(httpPort, '0.0.0.0', function() {
    console.log('Web server listening on port ' + httpPort);
  });

  const shutdown = () => {
    console.log("shutting down...");
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
})();
