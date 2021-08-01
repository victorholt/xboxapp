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
// Common functions used throughout the application.
// ---
var app = app || {};
app.common = app.common || {};

(function() {
  'use strict';

  // Common messages for the application.
  // ---
  app.common.ERROR_APPTITLE = '<h2>Application Error</h2>';
  app.common.ERROR_APPTEXT = '<p>Sorry, there seems to be an error with our application!</p>';

  app.common.ERROR_SUBMITTITLE = '<h2>Invalid Game</h2>';
  app.common.ERROR_SUBMITTEXT = '<p>Sorry, there was an error with your submission.</p><p>Please check to ensure your game title is not a duplicate and formatted correctly. Thanks!</p>';

  app.common.ERROR_CANADDGAMETITLE = '<h2>Already voted or added a game</h2>';
  app.common.ERROR_CANADDGAMETEXT = '<p>Sorry, you\'ve either voted or added a game today. You will however be able to vote/add a game tomorrow!</p><p>Also note that you will not be able to vote/add a game on Saturday or Sunday.</p>';

  app.common.ERROR_VOTETITLE = '<h2>Voting Error</h2>';
  app.common.ERROR_VOTETEXT = '<p>Sorry, you\'ve either already submitted a game or voted for today.</p>';

  app.common.ERROR_VOTE2TITLE = '<h2>Voting Closed</h2>';
  app.common.ERROR_VOTE2TEXT = '<p>Sorry, voting is closed today.</p>';

  // Common variables for the application.
  // ---

  // The time delay for the dialog box animation.
  app.common.dialogAnimationDelay = 300;

  // Common functions for the application.
  // ---

  // Scroll to the top of the window.
  app.common.scrollToTop = function(speed) {
    if (!speed || _.isUndefined(speed)) {
      speed = 200;
    }
    $('html, body').animate({scrollTop: 0}, speed, 'linear');
  };

  // Start/mount the ajax loading animation.
  app.common.startAjaxLoader = function() {
    React.renderComponent(new AjaxLoader(), $('#ajax-loader')[0]);
  };

  // End/unmount the ajax loading animation.
  app.common.endAjaxLoader = function() {
    React.unmountComponentAtNode($('#ajax-loader')[0]);
  };

  // Dialog Box functions
  // These are mostly used in the React component and are not directly called
  // in the application. The most useful call that may be used outside of the
  // component is the 'Close Dialog' function.
  // ---

  // Open the dialog box.
  app.common.openDialogBox = function(e, done) {
    if (e) e.preventDefault();

    app.common.scrollToTop(0);

    // Fix the centering of the dialog box. This is especially useful
    // for mobile devices.
    function update_position() {
      var dlgLeft = ($(document).width()/2) - ($('#dlg-box-content-container').width()/2) - 20;
      $('#dlg-box-content-container').css('left', dlgLeft);
      $('#dlg-box-content-container').css('top', '8%');
    }

    $(window).resize(update_position);

    // Handle when the escape key is pressed. We want to be cool
    // for desktop devices so give them an easy way to close the
    // dialog box.
    $(document).keyup(function(e) {
      if (e.keyCode == 27 && $('#dlg-box-container').attr('data-state') == 'visible') {
        app.common.closeDialogBox();
      }
    });

    // Show the dialog by updating the position and animating the
    // way it appears (coming from the top to the center of the page).
    $('#dlg-box').show(10, function() {
      $('#dlg-box-container').attr('data-state', 'visible');
      update_position();

      $('#dlg-box-container #dlg-box-content-container').css('top', '5%');
      $('#dlg-box-container #dlg-box-content-container').animate({
        opacity: 1,
        'top': '8%'
      }, app.common.dialogAnimationDelay, function() {
        if (done) done();
      });
    });
  };

  // Close the dialog box. We'll perform a similiar animation
  // and just bring it up to the top while fading it away.
  app.common.closeDialogBox = function(e, done) {
    if (e) e.preventDefault();

    var dlgCon = $('#dlg-box-container');
    if (dlgCon && !_.isUndefined(dlgCon) && $(dlgCon).is(':visible')) {
      $('#dlg-box-container').attr('data-state', 'hidden');

      $('#dlg-box-container #dlg-box-content-container').animate({
        opacity: 0,
        'marginTop': '-3%'
      }, app.common.dialogAnimationDelay, 'swing', function() {
        $('#dlg-box').fadeOut(app.common.dialogAnimationDelay, function() {
          React.unmountComponentAtNode($('#dlg-box')[0]);

          if (done) done();
        });
      });
    }
  };
})();
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
/** @jsx React.DOM */

// The main application object.
var app = app || {};
app.props = app.props || {};

// The modern canvas loader component.
var CanvasLoader = React.createClass({displayName: 'CanvasLoader',
  // Handle the canvas loader loop.
  handleLoop: function() {
    requestAnimFrame(this.handleLoop, app.props.ajaxLoaderCanvas);
    app.props.ajaxLoaderCanvasCtx.globalCompositeOperation = 'destination-out';
    app.props.ajaxLoaderCanvasCtx.fillStyle = 'rgba(255,255,255,.03)';
    app.props.ajaxLoaderCanvasCtx.fillRect(0,0,250,250);

    this.updateCanvasLoader();
    this.renderCanvasLoader();
  },

  // Update the canvas loader.
  updateCanvasLoader: function() {
    app.props.ajaxLoaderRotation += app.props.ajaxLoaderSpeed/100;
  },

  // Render the canvas loader.
  renderCanvasLoader: function() {
    app.props.ajaxLoaderCanvasCtx.save();
    app.props.ajaxLoaderCanvasCtx.globalCompositeOperation = 'source-over';
    app.props.ajaxLoaderCanvasCtx.translate(35, 35);
    app.props.ajaxLoaderCanvasCtx.rotate(app.props.ajaxLoaderRotation);
    var i = app.props.ajaxLoaderCount;

    while(i--){
      app.props.ajaxLoaderCanvasCtx.beginPath();
      app.props.ajaxLoaderCanvasCtx.arc(0, 0, 20, Math.random(), 1, false);
      app.props.ajaxLoaderCanvasCtx.arc(0, 0, 18, Math.random(), 1, false);
      app.props.ajaxLoaderCanvasCtx.fill();
    }
    app.props.ajaxLoaderCanvasCtx.restore();
  },

  // Setup the component when it's been loaded.
  componentDidMount: function() {
    // Pretty cool way to check if the function exists.
    window.requestAnimFrame = function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){window.setTimeout(a,1E3/60)}}();

    // Setup our canvas context and save it in our application properties.
    var canvas = $('#ajax-loader-canvas')[0];
    app.props.ajaxLoaderCanvasCtx = canvas.getContext('2d');
    app.props.ajaxLoaderCanvasCtx.lineWidth = 2;
    app.props.ajaxLoaderCanvasCtx.strokeStyle = 'rgba(255,255,255,.75)';
    app.props.ajaxLoaderCount = 128;
    app.props.ajaxLoaderRotation = 128 * (Math.PI/180);
    app.props.ajaxLoaderSpeed = 12;

    app.props.ajaxLoaderCanvas = canvas;

    // Handle the canvas loader loop.
    this.handleLoop();
  },

  // Render the canvas loader.
  render: function() {
    return (
      React.DOM.div( {className:"ajax-loader-container"}, 
        React.DOM.canvas( {id:"ajax-loader-canvas", width:"70", height:"70"})
      )
    );
  }
});

// The ajax loader which defaults to a non-canvas loader for backwards-compatibility support.
var AjaxLoader = React.createClass({displayName: 'AjaxLoader',
  // Render the canvas loader.
  render: function() {
    return (
      CanvasLoader(null )
    );
  }
});
/** @jsx React.DOM */

// The main application object.
var app = app || {};
app.props = app.props || {};

// The background slider object.
var BackgroundSlider = React.createClass({displayName: 'BackgroundSlider',
  // Handle the slider loop.
  handleLoop: function() {
    setInterval(function() {
      if (!_.isUndefined(app.props.backgroundImages) && !_.isEmpty(app.props.backgroundImages) &&
          app.props.backgroundImages.length > 1 && window.innerWidth > 1000) {
        /* This will need to be fixed for the mobile device experience. */

        if (app.props.backgroundImageDelta > app.props.backgroundImageTimeout) {
          app.props.backgroundImageDelta = 0;
          app.props.backgroundImageLocked = true;

          // Increment the current index so we can show the next image.
          app.props.backgroundImageCurrentIndex++;
          if (app.props.backgroundImageCurrentIndex >= app.props.backgroundImages.length) {
            app.props.backgroundImageCurrentIndex = 0;
          }

          // Update the background image.
          $('#background-slider-next').css('background-image', 'url(' + app.props.backgroundImages[app.props.backgroundImageCurrentIndex].src + ')')

          $('#background-slider-next').fadeIn(300, function() {
            $('#background-slider').css('background-image', 'url(' + app.props.backgroundImages[app.props.backgroundImageCurrentIndex].src + ')');

            // Give some time for the change to take place.
            setTimeout(function() {
              $('#background-slider-next').hide();
              app.props.backgroundImageLocked = false;
            }, 500);
          });
        } else {
          if (!app.props.backgroundImageLocked) {
            app.props.backgroundImageDelta++;
          }
        }
      }
    }, 1000);
  },

  // Handle when the component has mounted.
  componentDidMount: function() {
    // Set the current background image.
    app.props.backgroundImages = [];
    app.props.backgroundImageDelta = 0;
    app.props.backgroundImageCurrentIndex = 0;
    app.props.backgroundImageLocked = false;

    // Load up the images. Show the first background image once it's been loaded.
    var images = [
      'cityscape-bladeruner.jpg',
      'cloudy-peaks-final.jpg',
      'exterior-jungle-Final-2.jpg',
      'helius-final.jpg',
      'jungles-of-eknazaar.jpg'
    ];

    // There's a number of ways to be cool with this (render-wise), but we'll be simple for now.
    for (var i = 0; i < images.length; i++) {
      var img = new Image();
      img.onload = function() {
        if (_.isEmpty(app.props.backgroundImages)) {
          $('#background-slider').css('background-image', 'url(' + this.src + ')');
        }
        app.props.backgroundImages.push(this);
      }
      img.src = '/images/' + images[i];
    }

    // Handle slider loop.
    this.handleLoop();
  },

  // Render the slider.
  render: function() {
    // Set how often the image will change.
    app.props.backgroundImageTimeout = !_.isUndefined(this.props.imageTimeout) ? parseInt(this.props.imageTimeout) : 5;

    return (
      React.DOM.div( {id:"background-slider"}, 
        React.DOM.div( {id:"background-slider-next"}),
        React.DOM.div( {id:"background-slider-overlay"})
      )
    )
  }
});
/** @jsx React.DOM */

// The main application object.
var app = app || {};

// The dialog box object. Very very basic!
var DialogBox = React.createClass({displayName: 'DialogBox',
  // Handle when the component mounts.
  componentDidMount: function() {
    app.common.openDialogBox();

    if (this.props.onOpen && _.isFunction(this.props.onOpen)) {
      this.props.onOpen(this);
    }
  },

  // Handle when the dialog box is closed.
  componentWillUnmount: function() {
    if (this.props.onClose && _.isFunction(this.props.onClose)) {
      this.props.onClose(this);
    }
  },

  // This method handles closing the dialog.
  handleClose: function(e) {
    app.common.closeDialogBox();
  },

  // Render the component.
  render: function() {
    var className = 'dlg-box-default';
    if (this.props.className) {
      className = this.props.className;
    }
    className = 'dlg-box ' + className;

    return (
      React.DOM.div( {'data-state':"hidden", id:"dlg-box-container", className:className}, 
        React.DOM.div( {className:"dlg-box-bg"}),
        React.DOM.div( {id:"dlg-box-content-container"}, 
          React.DOM.div( {className:"dlg-box-close"}, React.DOM.span( {className:"icon-cancel", onClick:this.handleClose})),
          React.DOM.div( {className:"dlg-box-header", dangerouslySetInnerHTML:{__html: this.props.headerHTML}}),
          React.DOM.div( {className:"dlg-box-content", dangerouslySetInnerHTML:{__html: this.props.children}}),
          React.DOM.div( {className:"dlg-box-footer"}, 
            React.DOM.button( {className:"dlg-box-close-btn", onClick:this.handleClose}, "Close")
          )
        )
      )
    );
  }
});
/** @jsx React.DOM */

// The main application object.
var app = app || {};

// The main game application component which acts as our application template.
var GameApplication = React.createClass({displayName: 'GameApplication',
  // Render the component.
  render: function() {
    // Return the basic template for the application.
    return (
      React.DOM.div(null, 
        React.DOM.div( {id:"ajax-loader"}),
        React.DOM.div( {id:"dlg-box"}),

        BackgroundSlider( {imageTimeout:"10"} ),
        Navigation(null ),

        React.DOM.div( {id:"application-page"}),

        React.DOM.div( {className:"min-height"})
      )
    );
  }
});
/** @jsx React.DOM */

// The main application object.
var app = app || {};
app.cache = app.cache || {};

// The list of games already avaiable.
app.cache.games = app.cache.games || [];

// The main game application component which acts as our application template.
var GameOwnedPage = React.createClass({displayName: 'GameOwnedPage',
  // Display a single game list item.
  displayGameItem: function(game) {
    if (!game || _.isUndefined(game)) {
      return false;
    }

    return (
      React.DOM.li( {id:"game-entry-" + game.id, className:(game.status !== 'gotit') ? ' hidden' : ''}, 
        React.DOM.div( {className:"hover-overlay"}),

        React.DOM.div( {className:"left"}, 
          React.DOM.span( {id:"game-votes-" + game.id, className:"votes"}, game.votes),
          _.unescape(game.title)
        ),

        React.DOM.div( {className:"clear"})
      )
    );
  },

  // The initial state variables.
  getInitialState: function() {
    return {
      games: []
    };
  },

  // Handle the component after it's mounted.
  componentDidMount: function() {
    var _self = this;

    // Set the game data immediately for initial rendering.
    if (app.cache.games && !_.isUndefined(app.cache.games)) {
      this.setState({games: app.cache.games});
    }
    app.cache.dirty = false;

    // We'll want to check up on the games periodically for when they
    // are voted on and update the list accordingly.
    setInterval(function() {
      if (app.cache.dirty) {
        // Sort our list.
        app.cache.games = _.sortBy(app.cache.games, function(game) {
          return game.title;
        });

        _self.setState({games: app.cache.games});
        app.cache.dirty = false;
      }
    }, 200);

    // Startup our ajax loader.
    app.common.startAjaxLoader();

    app.api.getGames(function(res) {
      // Handle if we get an error first.
      if (!res) {
        // Stop our ajax loader.
        app.common.endAjaxLoader();

        React.renderComponent(
          DialogBox( {headerHTML:app.common.ERROR_APPTITLE}, 
            app.common.ERROR_APPTEXT
          )
        , $('#dlg-box')[0]);
      } else {
        // Update the state variable.
        app.cache.games = res;
        app.cache.dirty = true;

        // Stop our ajax loader.
        app.common.endAjaxLoader();
      }
    });
  },

  // Render the component.
  render: function() {
    // Return the voting page view.
    return (
      React.DOM.div( {className:"container"}, 
        React.DOM.div( {className:"row"}, 
          React.DOM.div( {className:"span12"}, 

            React.DOM.div( {className:"game-container"}, 
              React.DOM.div( {className:"game-container-bg"}),

              React.DOM.div( {className:"game-content left"}, 
                React.DOM.h2(null, "Games you already own!")
              ),
              React.DOM.div( {className:"clear"}),

              React.DOM.div( {className:"game-content"}, 
                React.DOM.ul(null, 
                  this.state.games.map(this.displayGameItem)
                )
              )
            )

          )
        )
      )
    );
  }
});
/** @jsx React.DOM */

// The main application object.
var app = app || {};
app.cache = app.cache || {};

// The list of games already avaiable.
app.cache.games = app.cache.games || [];

// The voting button.
var GameVoteButton = React.createClass({displayName: 'GameVoteButton',
  // Handle when the button is clicked.
  handleClick: function(e) {
    e.preventDefault();

    var _self = this;
    if (this.props.gameId && !_.isUndefined(this.props.gameId)) {
      // Startup our ajax loader.
      app.common.startAjaxLoader();

      app.api.addVote(this.props.gameId, function(res) {
        if (res) {
          // Check/increment the game vote.
          var votes = parseInt($('span#game-votes-' + _self.props.gameId).html());

          // Update the game in the list.
          var game = _.findWhere(app.cache.games, {id: _self.props.gameId});
          game.votes = ++votes;

          app.cache.dirty = true;

          // Stop our ajax loader.
          app.common.endAjaxLoader();
        } else {
          // Stop our ajax loader.
          app.common.endAjaxLoader();

          React.renderComponent(
            DialogBox( {headerHTML:app.common.ERROR_VOTETITLE}, 
              app.common.ERROR_VOTETEXT
            )
          , $('#dlg-box')[0]);
        }
      });
    } else {
      // Stop our ajax loader.
      app.common.endAjaxLoader();

      React.renderComponent(
        DialogBox( {headerHTML:app.common.ERROR_APPTITLE}, 
          app.common.ERROR_APPTEXT
        )
      , $('#dlg-box')[0]);
    }
  },

  // Render the button.
  render: function() {
    return (
      React.DOM.button( {onClick:this.handleClick}, "Vote")
    );
  }
});

// The own button.
var GameOwnButton = React.createClass({displayName: 'GameOwnButton',
  // Handle when the button is clicked.
  handleClick: function(e) {
    e.preventDefault();

    // Startup our ajax loader.
    app.common.startAjaxLoader();

    var _self = this;
    if (this.props.gameId && !_.isUndefined(this.props.gameId)) {
      // Set the gotit status of the game.
      app.api.setGotIt(this.props.gameId, function(res) {
        if (res) {
          // Remove the game from the list.
          app.api.getGames(function(res) {
            // Update the app game cache.
            if (res) {
              app.cache.games = res;
              app.cache.dirty = true;
            }
          });

          // Stop our ajax loader.
          app.common.endAjaxLoader();
        } else {
          // Stop our ajax loader.
          app.common.endAjaxLoader();

          React.renderComponent(
            DialogBox( {headerHTML:app.common.ERROR_APPTITLE}, 
              app.common.ERROR_APPTEXT
            )
          , $('#dlg-box')[0]);
        }
      });
    }
  },

  // Render the button.
  render: function() {
    return (
      React.DOM.button( {onClick:this.handleClick}, "Own")
    );
  }
});

// The main game application component which acts as our application template.
var GameVotingPage = React.createClass({displayName: 'GameVotingPage',
  // Handle the game submission.
  handleSubmit: function(e) {
    e.preventDefault();
    var _self = this,
        gameTitle = $('#gameTitle').val();

    // Startup our ajax loader.
    app.common.startAjaxLoader();

    // Validate the title of the game and add it.
    app.api.addGame(gameTitle, function(res) {
      // If we were successful add the game title to our list of games
      // and update the view.
      if (res) {
        // Find our game so we can add it to the app cache.
        app.api.findGame(gameTitle, function(game) {
          app.cache.games.push(game);
          _self.setState({games: app.cache.games});
        });

        // Stop our ajax loader.
        app.common.endAjaxLoader();
      } else {
        // Stop our ajax loader.
        app.common.endAjaxLoader();

        // Display a dialog box to let the user know there was an error
        // adding the game.
        if (app.utils.canVote(app.cache.lastVotedTime)) {
          React.renderComponent(
            DialogBox( {headerHTML:app.common.ERROR_SUBMITTITLE}, 
              app.common.ERROR_SUBMITTEXT
            )
          , $('#dlg-box')[0]);
        } else {
          React.renderComponent(
            DialogBox( {headerHTML:app.common.ERROR_CANADDGAMETITLE}, 
              app.common.ERROR_CANADDGAMETEXT
            )
          , $('#dlg-box')[0]);
        }
      }
    });

    // Reset the form input.
    document.GameForm.reset();
  },

  // Handle adding a vote to a game.
  handleGameVote: function(e) {
    e.preventDefault();

    // Startup our ajax loader.
    app.common.startAjaxLoader();

    // Add our vote!
    app.api.addVote(function(res) {
      if (res) {
        // Find our game and increment the vote.
        app.common.endAjaxLoader();
      } else {

      }
    });
  },

  // Handle owning a particular game.
  handleOwnGame: function(e) {
    e.preventDefault();

    // Startup our ajax loader.
    app.common.startAjaxLoader();
  },

  // Display a single game list item.
  displayGameItem: function(game) {
    if (!game || _.isUndefined(game)) {
      return false;
    }

    return (
      React.DOM.li( {id:"game-entry-" + game.id, className:(game.status === 'gotit') ? ' hidden' : ''}, 
        React.DOM.div( {className:"hover-overlay"}),

        React.DOM.div( {className:"left"}, 
          React.DOM.span( {id:"game-votes-" + game.id, className:"votes"}, game.votes),
          _.unescape(game.title)
        ),
        React.DOM.div( {className:"right"}, 
          GameVoteButton( {gameId:game.id} ),
          GameOwnButton( {gameId:game.id} )
        ),

        React.DOM.div( {className:"clear"})
      )
    );
  },

  // The initial state variables.
  getInitialState: function() {
    return {
      games: []
    };
  },

  // Handle the component after it's mounted.
  componentDidMount: function() {
    var _self = this;

    // Set the game data immediately for initial rendering.
    if (app.cache.games && !_.isUndefined(app.cache.games)) {
      this.setState({games: app.cache.games});
    }
    app.cache.dirty = false;

    // We'll want to check up on the games periodically for when they
    // are voted on and update the list accordingly.
    setInterval(function() {
      if (app.cache.dirty) {
        // Sort our list.
        app.cache.games = _.sortBy(app.cache.games, function(game) {
          return -game.votes;
        });

        _self.setState({games: app.cache.games});
        app.cache.dirty = false;
      }
    }, 200);

    // Startup our ajax loader.
    app.common.startAjaxLoader();

    app.api.getGames(function(res) {
      // Handle if we get an error first.
      if (!res) {
        // Stop our ajax loader.
        app.common.endAjaxLoader();

        React.renderComponent(
          DialogBox( {headerHTML:app.common.ERROR_APPTITLE}, 
            app.common.ERROR_APPTEXT
          )
        , $('#dlg-box')[0]);
      } else {
        // Update the state variable.
        app.cache.games = res;
        app.cache.dirty = true;

        // Stop our ajax loader.
        app.common.endAjaxLoader();
      }
    });
  },

  // Render the component.
  render: function() {
    // Return the voting page view.
    return (
      React.DOM.div( {className:"container"}, 
        React.DOM.div( {className:"row"}, 
          React.DOM.div( {className:"span12"}, 

            React.DOM.div( {className:"game-container"}, 
              React.DOM.div( {className:"game-container-bg"}),

              React.DOM.div( {className:"game-content left"}, 
                React.DOM.h2(null, "Vote for your favorite games!")
              ),

              React.DOM.div( {className:"game-form right"}, 
                React.DOM.form( {id:"GameForm", name:"GameForm", onSubmit:this.handleSubmit}, 
                  React.DOM.input( {type:"text", id:"gameTitle", name:"gameTitle", placeholder:"Add new game"} ),
                  React.DOM.button( {onClick:this.handleSubmit}, "Add Game")
                )
              ),
              React.DOM.div( {className:"clear"}),

              React.DOM.div( {className:"game-content"}, 
                React.DOM.ul(null, 
                  this.state.games.map(this.displayGameItem)
                )
              )
            )

          )
        )
      )
    );
  }
});
/** @jsx React.DOM */

// The main application object.
var app = app || {};

// The navigation object.
Navigation = React.createClass({displayName: 'Navigation',
  // Clear out our games and the app.cache.
  clearGames: function(e) {
    e.preventDefault();

    // Startup our ajax loader.
    app.common.startAjaxLoader();

    app.api.clearGames(function(res) {
      // Stop our ajax loader.
      app.cache.dirty = true;
      app.common.endAjaxLoader();
    });
  },

  // Show the navigation.
  showNavigation: function(e) {
    $('ul#navlinks').toggle();
    console.log('showing navigation');
  },

  // Render the navigation.
  render: function() {
    return (
      React.DOM.div( {className:"container-fluid"}, 
        React.DOM.div( {className:"row"}, 
          React.DOM.div( {className:"span12"}, 

            React.DOM.div( {id:"navigation"}, 

              React.DOM.div( {className:"span6"}, 
                React.DOM.ul( {className:"left"}, 
                  React.DOM.li(null, 
                    React.DOM.span( {className:"nav-title"}, "XBOX Games")
                  )
                )
              ),

              React.DOM.div( {className:"span6"}, 
                React.DOM.div( {className:"menubars", onClick:this.showNavigation}, 
                  React.DOM.ul( {id:"menubars", className:"right hidden-desktop"}, 
                    React.DOM.li(null, 
                      React.DOM.span( {className:"navbar1"}),
                      React.DOM.span( {className:"navbar2"}),
                      React.DOM.span( {className:"navbar3"})
                    )
                  )
                ),

                React.DOM.ul( {id:"navlinks", className:"right visible-desktop"}, 
                  React.DOM.li(null, 
                    React.DOM.a( {href:"/"}, "Home"),
                    React.DOM.a( {href:"/owned-games"}, "Owned Games"),
                    React.DOM.a( {href:"javascript: void(0);", onClick:this.clearGames}, "Clear Games")
                  )
                )
              ),

              React.DOM.div( {className:"clear"})
            )

          )
        )
      )
    );
  }
});
// The Backbone router file. This is all we really use backbone for.
'use strict';

// Application variables.
// ---
var app = app || {};
// The properties of the application (essentially global application data variables).
app.props = app.props || {};
// The utility functions.
app.utils = app.utils || {};
// Common variables and front-end functionality.
app.common = app.common || {};
// The current view component that has been loaded.
app.loadedComponent = null;

(function() {
  // The backbone router.
  app.AppRouter = Backbone.Router.extend({
    // Our list of routes.
    routes: {
      "": "indexAction",
      "owned-games": "gamesOwnedAction",
      "*path": "error404Action"
    },

    // Initialize our router.
    initialize: function(options) {
      // Create our worker and store it in the app.props variable.
      if (window.Worker && !_.isUndefined(window.Worker)) {
        app.props.serviceWorker = new Worker('/js/serviceWorker.js');
      }

      // Check if we can retrieve app.cache data. Even if we are supporting IE8+ it's still
      // good to do a check so everything doesn't break.
      if (localStorage && !_.isUndefined(localStorage)) {
        if (localStorage.appData && !_.isUndefined(localStorage.appData)) {
          app.cache = JSON.parse(localStorage.appData);
        }

        // Setup an interval to save app.cache data to the local storage.
        setInterval(function() {
          localStorage.setItem('appData', JSON.stringify(app.cache));
        }, 500);
      }

      Backbone.history.start({pushState: true});
    },

    // The home index action.
    indexAction: function() {
      // Check if we need to unmount the current component.
      if (app.loadedComponent) {
        React.unmountComponentAtNode($('#application-page')[0]);
        app.loadedComponent = null;
      }

      // Load up our react component.
      app.loadedComponent = React.renderComponent(new GameVotingPage(), $('#application-page')[0]);
    },

    // The games owned action.
    gamesOwnedAction: function() {
      // Check if we need to unmount the current component.
      if (app.loadedComponent) {
        React.unmountComponentAtNode($('#application-page')[0]);
        app.loadedComponent = null;
      }

      // Load up our react component.
      app.loadedComponent = React.renderComponent(new GameOwnedPage(), $('#application-page')[0]);
    },

    // Our 404 page action.
    error404Action: function() {
      console.log('page not found');
    }
  });

  // Handle the routes a bit more smoothly. Prevents a page refresh on links.
  $(document).on('click', "a[href^='/']", function(event) {
    var href = $(event.currentTarget).attr('href');
    var passthruList = [/\/login/];
    var passthru = 0;

    for (var i = 0; i < passthruList.length; i++) {
      if (passthruList[i].test(href)) {
        passthru = 1;
        break;
      }
    }

    if (!passthru && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      event.preventDefault();

      var url = href.replace(/^\//,'').replace('\#\!\/','');
      app.router.navigate(url, {trigger: true});

      return false;
    } else {
      window.location = href;
    }

    return true;
  });
})();
