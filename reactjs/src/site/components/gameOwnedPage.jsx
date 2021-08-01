/** @jsx React.DOM */

// The main application object.
var app = app || {};
app.cache = app.cache || {};

// The list of games already avaiable.
app.cache.games = app.cache.games || [];

// The main game application component which acts as our application template.
var GameOwnedPage = React.createClass({
  // Display a single game list item.
  displayGameItem: function(game) {
    if (!game || _.isUndefined(game)) {
      return false;
    }

    return (
      <li id={"game-entry-" + game.id} className={(game.status !== 'gotit') ? ' hidden' : ''}>
        <div className="hover-overlay"></div>

        <div className="left">
          <span id={"game-votes-" + game.id} className="votes">{game.votes}</span>
          {_.unescape(game.title)}
        </div>

        <div className="clear"></div>
      </li>
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
          <DialogBox headerHTML={app.common.ERROR_APPTITLE}>
            {app.common.ERROR_APPTEXT}
          </DialogBox>
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
      <div className="container">
        <div className="row">
          <div className="span12">

            <div className="game-container">
              <div className="game-container-bg"></div>

              <div className="game-content left">
                <h2>Games you already own!</h2>
              </div>
              <div className="clear"></div>

              <div className="game-content">
                <ul>
                  {this.state.games.map(this.displayGameItem)}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
});