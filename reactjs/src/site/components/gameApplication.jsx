/** @jsx React.DOM */

// The main application object.
var app = app || {};

// The main game application component which acts as our application template.
var GameApplication = React.createClass({
  // Render the component.
  render: function() {
    // Return the basic template for the application.
    return (
      <div>
        <div id="ajax-loader"></div>
        <div id="dlg-box"></div>

        <BackgroundSlider imageTimeout="10" />
        <Navigation />

        <div id="application-page"></div>

        <div className="min-height"></div>
      </div>
    );
  }
});