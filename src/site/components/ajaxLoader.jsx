/** @jsx React.DOM */

// The main application object.
var app = app || {};
app.props = app.props || {};

// The modern canvas loader component.
var CanvasLoader = React.createClass({
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
      <div className="ajax-loader-container">
        <canvas id="ajax-loader-canvas" width="70" height="70"></canvas>
      </div>
    );
  }
});

// The ajax loader which defaults to a non-canvas loader for backwards-compatibility support.
var AjaxLoader = React.createClass({
  // Render the canvas loader.
  render: function() {
    return (
      <CanvasLoader />
    );
  }
});