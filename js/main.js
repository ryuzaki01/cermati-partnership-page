'use strict';

var App = require('./app');

// Mobile browser quirks
if (App.isMobile) {
  $('#body').css('min-height', '418px');
}

window.App = App;
App.init();
