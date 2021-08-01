/** @jsx React.DOM */

// The main application object.
var app = app || {};
app.props = app.props || {};

// The background slider object.
var BackgroundSlider = React.createClass({
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
      <div id="background-slider">
        <div id="background-slider-next"></div>
        <div id="background-slider-overlay"></div>
      </div>
    )
  }
});