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