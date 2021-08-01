// Utility functions for helping to do validation and other tasks.
// ---
var app = app || {};
app.utils = app.utils || {};

(function() {
  'use strict';

  // This function checks if we have a valid game entry and returns true|false.
  app.utils.isValidGameEntry = function(gameList, gameTitle) { //return true;
    // Perform a basic search of the game list.
    if (gameList && !_.isUndefined(gameList) && _.isObject(gameList)) {
      gameTitle = _.escape(gameTitle).trim();

      // Check if the game exists.
      var gameExists = _.find(gameList, function(game) {
        if (game.title.toLowerCase() == gameTitle.toLowerCase()) {
          return true;
        }
      });

      if (gameTitle !== '' && !gameExists) {
        return true;
      }
    }

    return false;
  };

  // This function checks if we can vote based on the given time.
  app.utils.canVote = function(lastVotedTime) { //return true;
    // If we don't have a lastVoteTime just set it to 0.
    if (!lastVotedTime || _.isUndefined(lastVotedTime)) {
      lastVotedTime = 0;
    }

    // Check our voting date.
    var now = new Date(),
        curDate = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate();

    var lastVote = lastVotedTime !== 0 ? new Date(lastVotedTime) : new Date(1970, 1, 1),
        lastVoteDate = lastVote.getFullYear() + '-' + lastVote.getMonth() + '-' + lastVote.getDate();

    if (curDate == lastVoteDate) {
      return false;
    }

    // Check if we can vote based on if it's Saturday or Sunday.
    if (now.getDay() === 0 || now.getDay() === 6) {
      return false;
    }

    return true;
  };

})();