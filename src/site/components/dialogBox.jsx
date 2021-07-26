/** @jsx React.DOM */

// The main application object.
var app = app || {};

// The dialog box object. Very very basic!
var DialogBox = React.createClass({
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
      <div data-state="hidden" id="dlg-box-container" className={className}>
        <div className="dlg-box-bg"></div>
        <div id="dlg-box-content-container">
          <div className="dlg-box-close"><span className="icon-cancel" onClick={this.handleClose}></span></div>
          <div className="dlg-box-header" dangerouslySetInnerHTML={{__html: this.props.headerHTML}}></div>
          <div className="dlg-box-content" dangerouslySetInnerHTML={{__html: this.props.children}}></div>
          <div className="dlg-box-footer">
            <button className="dlg-box-close-btn" onClick={this.handleClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }
});