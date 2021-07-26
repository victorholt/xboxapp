/** @jsx React.DOM */

// The main application object.
var app = app || {};

// The navigation object.
Navigation = React.createClass({
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
      <div className="container-fluid">
        <div className="row">
          <div className="span12">

            <div id="navigation">

              <div className="span6">
                <ul className="left">
                  <li>
                    <span className="nav-title">XBOX Games</span>
                  </li>
                </ul>
              </div>

              <div className="span6">
                <div className="menubars" onClick={this.showNavigation}>
                  <ul id="menubars" className="right hidden-desktop">
                    <li>
                      <span className="navbar1"></span>
                      <span className="navbar2"></span>
                      <span className="navbar3"></span>
                    </li>
                  </ul>
                </div>

                <ul id="navlinks" className="right visible-desktop">
                  <li>
                    <a href="/">Home</a>
                    <a href="/owned-games">Owned Games</a>
                    <a href="javascript: void(0);" onClick={this.clearGames}>Clear Games</a>
                  </li>
                </ul>
              </div>

              <div className="clear"></div>
            </div>

          </div>
        </div>
      </div>
    );
  }
});