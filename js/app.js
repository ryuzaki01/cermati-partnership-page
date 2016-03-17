'use strict';

var $ = require('jquery');
window.$ = $;

var _ = require('lodash');
var handlers = require('./handlers');
var completeForm = require('./olx/cimb-niaga-auto-finance/complete-form');
var provinces = require('./data/provinces');
var cities = require('./data/cities');
var cityMappings = require('./data/cityMappings');

var $body = $('body');

module.exports = {
  isMobile: window.innerWidth <= 480,
  isTablet: window.innerWidth <= 768 && window.innerWidth > 480,
  provinces: provinces,
  cities: cities,
  cityMappings: cityMappings,
  init: function () {
    // Initialize App
    $(document).ready(function () {
      // Handlers
      handlers.handleTabs();
      handlers.handleAutoCompleteCity();
      completeForm.ready();
    });
  }
};
