'use strict';

var $ = require('jquery');
window.$ = $;

var _ = require('lodash');
var handlers = require('./handlers');


var $body = $('body');

module.exports = {
  isMobile: window.innerWidth <= 480,
  isTablet: window.innerWidth <= 768 && window.innerWidth > 480,
  init: function () {
    // Initialize App

    $(document).ready(function () {
      // Handlers
      handlers.handleTabs();
      handlers.handleAutoCompleteCity();
    });
  }
};
