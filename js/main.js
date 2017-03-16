window.onload = function() {
  var sections = Array.from(document.querySelectorAll('section'));
  var deck = new MVSD(sections);
  //document.body.mozRequestFullScreen();
};

function onDCL() {

  // initialize websocket connection
  var server = 'localhost', //window.location.hostname,
      port = 8009,
      socketURL = 'ws://' + server + ':' + port,
      socket = new WebSocket(socketURL);

  socket.onopen = function() {
    console.log('socket opened')

    // ensures binary sends work correctly
    socket.binaryType = "arraybuffer";

    socket.onmessage = function(msg) {
      var obj = JSON.parse(msg.data);
      console.log('ws message:', obj)
      if (obj.clients != undefined) {
        updateViewerData(obj);
      }
    };
  };

}
window.addEventListener('DOMContentLoaded', onDCL);

function updateViewerData(data) {
  console.log('updating data');
  var bindings = {
    connected: { selector: '#countConnected', data: 0 },
    desktop: { selector: '#countDesktop', data: 0 },
    mobile: { selector: '#countMobile', data: 0 },
    android: { selector: '#countAndroid', data: 0 },
    ios: { selector: '#countIOS', data: 0 },
    other: { selector: '#countOther', data: 0 }
  };

  bindings.connected.data = data.clients;

  var stats = getUAStats(data.userAgents);

  Object.keys(stats).forEach(function(key) {
    bindings[key].data = stats[key];
  });

  Object.keys(bindings).forEach(function(key) {
    var binding = bindings[key];
    document.querySelector(binding.selector).innerText = binding.data;
  });
}

function getUAStats(data) {
  var stats = {
    desktop: 0,
    mobile: 0,
    android: 0,
    ios: 0,
    other: 0
  };

  Object.keys(data).forEach(function(ua) {
    // Mobile vs desktop
    if (ua.indexOf('Mobi') != -1) {
      stats.mobile += data[ua];
    }
    else {
      stats.desktop += data[ua];
    }
    // Which mobile platform
    if (ua.indexOf('Android') != -1) {
      stats.android += data[ua];
    }
    // iOS
    else if (ua.indexOf('Mobile Safari') != -1) {
      stats.ios += data[ua];
    }
    // Other mobile
    else {
      stats.other += data[ua];
    }
  });

  return stats;
}
