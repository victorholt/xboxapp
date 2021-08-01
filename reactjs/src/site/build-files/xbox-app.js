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