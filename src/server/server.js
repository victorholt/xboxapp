// Simple ExpressJS webserver so we can test locally.
//
// This web server should not be part of the project, but rather the project will be
// able to exists on any web server.
// ---

var path = require('path'),
    fs = require('fs'),
    express = require('express'),
    app = express(),
    config = require('./config.json'),
    middleware = require('./middleware');

// Setup the middleware.
middleware.setup(__dirname, app);

// Since this is a single-page static html page we only need to get the index.html file.
app.get('*', function(req, res) {
  var filePath = path.join(__dirname, '../../public/index.html');
  fs.exists(filePath, function(exists) {
    if (exists) {
      fs.readFile(filePath, function(err, data) {
        if (err) {
          // Handle the error, this could be more elegant for a webserver.
          return res.send('webserver error');
        }

        // Render the page.
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Length', data.length);
        res.send(data);
      });
    } else {
      // Handle the error, this could be more elegant for a webserver.
      return res.send('webserver error | file not found');
    }
  });
});

// Start up our webserver.
app.listen(config.server.port, function() {
  console.log('Starting up the server on port ' + config.server.port);
});