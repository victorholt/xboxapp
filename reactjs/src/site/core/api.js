// The API service.

var app = app || {};
app.props = app.props || {};
app.api = app.api || {};
app.cache = app.cache || {};

(function() {
  'use strict';

  app.api = {
    apiUrl: 'http://js.november.sierrabravo.net/challenge/',
    apiKey: 'a29238323ada61ccae7dece63fd9f51d',

    // Check our user key.
    checkKey: function(done) {
      if (app.props.serviceWorker && !_.isUndefined(app.props.serviceWorker)) {
        // Push request off to the worker.
        this.ajaxWorkerCall('checkKey', {}, done);
      } else {
        // Main thread call.
        this.ajaxCall('checkKey', {}, done);
      }
    },

    // Get our current list of games.
    getGames: function(done) {
      // Check the key and retrieve the list of games.
      this.checkKey(function(res) {
        if (res === true) {
          // We're good, lets get our games!
          if (app.props.serviceWorker && !_.isUndefined(app.props.serviceWorker)) {
            app.api.ajaxWorkerCall('getGames', {}, done);
          } else {
            app.api.ajaxCall('getGames', {}, done);
          }
        } else {
          // Handle our error.
          if (done && !_.isUndefined(done)) {
            done(false);
          }
        }
      });
    },

    // Add a vote for a game.
    addVote: function(gameId, done) {
      // Handle our validation with the application cache.
      if (!app.utils.canVote(app.cache.lastVotedTime)) {
        return done(false);
      }

      // Check our key and attempt to add a vote.
      this.checkKey(function(res) {
        if (res === true) {
          // Check if we can use our worker.
          if (app.props.serviceWorker && !_.isUndefined(app.props.serviceWorker)) {
            // We're good, lets vote on our games!
            app.api.ajaxWorkerCall('addVote', {id: gameId}, function(success) {
              if (success === true) {
                // Let's update the application cache that we've already voted.
                app.cache.lastVotedTime = Date.now();
              }

              done(success);
            });
          } else {
            // We're good, lets vote on our games!
            app.api.ajaxCall('addVote', {id: gameId}, function(success) {
              if (success === true) {
                // Let's update the application cache that we've already voted.
                app.cache.lastVotedTime = Date.now();
              }

              done(success);
            });
          }
        } else {
          // Handle our error.
          if (done && !_.isUndefined(done)) {
            done(false);
          }
        }
      });
    },

    // Add a game to the list.
    addGame: function(gameTitle, done) {
      // Check if we can use our worker.
      if (app.props.serviceWorker && !_.isUndefined(app.props.serviceWorker)) {
        this.checkKey(function(res) {
          if (res === true) {
            // We're good, lets add our games!
            app.api.ajaxWorkerCall('addGame', {title: gameTitle}, function(success) {
              if (success === true) {
                // Let's update the application cache that we've already voted.
                app.cache.lastVotedTime = Date.now();
              }
              done(success);
            });
          } else {
            // Handle our error.
            if (done && !_.isUndefined(done)) {
              done(false);
            }
          }
        });
      } else {
        // Add game entry the standard way.
        if (app.utils.isValidGameEntry(app.cache.games, gameTitle) &&
            app.utils.canVote(app.cache.lastVotedTime)) {
          // Check the key and add to the list of games.
          this.checkKey(function(res) {
            if (res === true) {
              // We're good, lets add our games!
              app.api.ajaxCall('addGame', {title: gameTitle}, function(success) {
                if (success === true) {
                  // Let's update the application cache that we've already voted.
                  app.cache.lastVotedTime = Date.now();
                }

                done(success);
              });
            } else {
              // Handle our error.
              if (done && !_.isUndefined(done)) {
                done(false);
              }
            }
          });

        } else {
          done(false);
        }
      }
    },

    // Flag that we've got the game.
    setGotIt: function(gameId, done) {
      // Check the key and add to the list of games.
      this.checkKey(function(res) {
        if (res === true) {
          // We're good, lets add our games!
          if (app.props.serviceWorker && !_.isUndefined(app.props.serviceWorker)) {
            app.api.ajaxWorkerCall('setGotIt', {id: gameId}, function(success) {
              done(success);
            });
          } else {
            app.api.ajaxCall('setGotIt', {id: gameId}, function(success) {
              done(success);
            });
          }
        } else {
          // Handle our error.
          if (done && !_.isUndefined(done)) {
            done(false);
          }
        }
      });
    },

    // Clear out our games and the application cache.
    clearGames: function(done) {
      // Check the key and add to the list of games.
      this.checkKey(function(res) {
        if (res === true) {
          // We're good, lets add our games!
          if (app.props.serviceWorker && !_.isUndefined(app.props.serviceWorker)) {
            app.api.ajaxWorkerCall('clearGames', {}, function(success) {
              if (success === true) {
                // Let's update the application cache that we've already voted.
                app.cache = {};
              }

              done(success);
            });
          } else {
            app.api.ajaxCall('clearGames', {}, function(success) {
              if (success === true) {
                // Let's update the application cache that we've already voted.
                app.cache = {};
              }

              done(success);
            });
          }
        } else {
          // Handle our error.
          if (done && !_.isUndefined(done)) {
            done(false);
          }
        }
      });
    },

    // This method helps us to find the game id for a given game title.
    findGame: function(gameTitle, done) {
      gameTitle = _.escape(gameTitle).trim();

      this.getGames(function(games) {
        if (games && !_.isEmpty(games)) {
          var game = _.find(games, function(g) {
            if (g.title.toLowerCase() == gameTitle.toLowerCase()) {
              return g;
            }
          });

          done(game);
        } else {
          done(false);
        }
      });
    },

    // Handle our ajax call that we'll be utilizing a lot.
    ajaxCall: function(uri, data, done) {
      // Ensure our data is an object.
      if (_.isUndefined(data) || !_.isObject(data)) {
        return done(false);
      }

      // Check if we've included the api key in the data.
      // Manually add it if we've have not included it.
      if (_.isUndefined(data.apiKey)) {
        data.apiKey = this.apiKey;
      }

      // Return our xhr allow our 'done' callback to handle the response.
      var xhr = $.ajax({
        url: this.apiUrl + uri,
        jsonp: 'callback',
        dataType: 'jsonp',
        data: data
      });

      xhr.done(function(res) {
        if (done && !_.isUndefined(done)) {
          done(res);
        }
      });
    },

    // Start up a worker thread.
    ajaxWorkerCall: function(uri, data, done) {
      // Handle our worker response.
      app.props.serviceWorker.onmessage = function(e) {
        if (done && !_.isUndefined(done)) {
          done(e.data);
        }
      };

      // Create the api url.
      var apiUrl = this.apiUrl + uri + '?callback=handleRequest&apiKey=' + this.apiKey;

      // Add any additional data parameters to the url.
      if (data && !_.isUndefined(data) && _.isObject(data) && !_.isEmpty(data)) {
        _.each(data, function(val, key) {
          apiUrl += '&' + key + '=' + val;
        });
      }

      // Send some work to our worker.
      app.props.serviceWorker.postMessage({
        request: uri,
        apiUrl: apiUrl,
        lastVotedTime: app.cache.lastVotedTime,
        games: app.cache.games,
        params: data
      });
    }
  };
})();