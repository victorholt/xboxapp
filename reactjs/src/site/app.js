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
