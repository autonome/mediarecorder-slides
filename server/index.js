/* globals require */
"use strict";

const httpPort = 8000;
const ws = require("ws");
const wsPort = 8009;
const express = require("express");

(() => {

  // Viewer data
  var stats = {
    clients: 0,
    userAgents: {}
  };

  // Web server
  var app = new express();
  
  // Web socket server
  var wss = new ws.Server({ port: wsPort, clientTracking: true });

  function update() {
    wss.broadcast(JSON.stringify(stats));
  }

	// Implement broadcast
	wss.broadcast = function broadcast(strMsg) {
  	wss.clients.forEach(function each(client) {
    	if (client.readyState === client.OPEN) {
      	client.send(strMsg);
    	}
  	});
	};

  wss.on('connection', function(conn) {
    update();

    conn.on('message', function incoming(data, flags) {
      console.log('new message', data);
      var msg = JSON.parse(data);

      console.log('msg', msg);

      if (msg.firstRun) {
        stats.clients++;
      }

      update();
    });
  });

  // Upon each new connection, broadcast data to all clients
  app.use(function(req, res, next) {
    if (req.url == '/slides/viewer.html') {
      var ua = req.headers['user-agent'];
      if (stats.userAgents[ua]) {
        stats.userAgents[ua]++;
      }
      else {
        stats.userAgents[ua] = 1;
      }
      update();
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
