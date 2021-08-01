/** @jsx React.DOM */

// The main application object.
var app = app || {};
app.cache = app.cache || {};

// The list of games already avaiable.
app.cache.games = app.cache.games || [];

// The voting button.
var GameVoteButton = React.createClass({
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
            <DialogBox headerHTML={app.common.ERROR_VOTETITLE}>
              {app.common.ERROR_VOTETEXT}
            </DialogBox>
          , $('#dlg-box')[0]);
        }
      });
    } else {
      // Stop our ajax loader.
      app.common.endAjaxLoader();

      React.renderComponent(
        <DialogBox headerHTML={app.common.ERROR_APPTITLE}>
          {app.common.ERROR_APPTEXT}
        </DialogBox>
      , $('#dlg-box')[0]);
    }
  },

  // Render the button.
  render: function() {
    return (
      <button onClick={this.handleClick}>Vote</button>
    );
  }
});

// The own button.
var GameOwnButton = React.createClass({
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
            <DialogBox headerHTML={app.common.ERROR_APPTITLE}>
              {app.common.ERROR_APPTEXT}
            </DialogBox>
          , $('#dlg-box')[0]);
        }
      });
    }
  },

  // Render the button.
  render: function() {
    return (
      <button onClick={this.handleClick}>Own</button>
    );
  }
});

// The main game application component which acts as our application template.
var GameVotingPage = React.createClass({
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
            <DialogBox headerHTML={app.common.ERROR_SUBMITTITLE}>
              {app.common.ERROR_SUBMITTEXT}
            </DialogBox>
          , $('#dlg-box')[0]);
        } else {
          React.renderComponent(
            <DialogBox headerHTML={app.common.ERROR_CANADDGAMETITLE}>
              {app.common.ERROR_CANADDGAMETEXT}
            </DialogBox>
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
      <li id={"game-entry-" + game.id} className={(game.status === 'gotit') ? ' hidden' : ''}>
        <div className="hover-overlay"></div>

        <div className="left">
          <span id={"game-votes-" + game.id} className="votes">{game.votes}</span>
          {_.unescape(game.title)}
        </div>
        <div className="right">
          <GameVoteButton gameId={game.id} />
          <GameOwnButton gameId={game.id} />
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
                <h2>Vote for your favorite games!</h2>
              </div>

              <div className="game-form right">
                <form id="GameForm" name="GameForm" onSubmit={this.handleSubmit}>
                  <input type="text" id="gameTitle" name="gameTitle" placeholder="Add new game" />
                  <button onClick={this.handleSubmit}>Add Game</button>
                </form>
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