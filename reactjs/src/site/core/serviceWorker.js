// This is the main web worker file that handles the web worker requests.
// This file is compiled separately in Grunt.

// Import some libraries.
importScripts('//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min.js');

// Service call to check if the API key is valid.
var handleRequest = function(data) {
  self.postMessage(data);
};

// Ajax service call functions.
// ---

// Our event listener.
self.addEventListener('message', function(e) {
  // Check the type of call we're attempting to make.
  switch (e.data.request) {
    case 'addVote':
    case 'checkKey':
    case 'clearGames':
    case 'getGames':
    case 'setGotIt':
      if (e.data.apiUrl && !_.isUndefined(e.data.apiUrl)) {
        // Call our api url.
        importScripts(e.data.apiUrl);
      }
      break;

    case 'addGame':
      if (app.utils.isValidGameEntry(e.data.games, e.data.params.title) &&
          app.utils.canVote(e.data.lastVotedTime)) {
        if (e.data.apiUrl && !_.isUndefined(e.data.apiUrl)) {
          // Call our api url.
          importScripts(e.data.apiUrl);
        }
      } else {
        self.postMessage(false);
      }
      break;

    default:
      self.postMessage(false);
      break;
  }
}, false);