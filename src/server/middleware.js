// Handle middleware of the server setup.
// ---

var path = require('path'),
	express = require('express');

// Setup the application middleware.
// ---
function setup(baseDir, app) {
  // This can also be done in your Nginx or Apache config/htaccess file.
  var assetsDir = path.join(baseDir, '../../public/');
  app.use("/images", express.static(path.join(assetsDir, 'images')));
  app.use("/css", express.static(path.join(assetsDir, 'css')));
  app.use("/js", express.static(path.join(assetsDir, 'js')));
}

module.exports = {
  setup: setup
};