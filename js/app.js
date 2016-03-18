'use strict';

var $ = require('jquery');
window.$ = $;

var _ = require('lodash');
var handlers = require('./handlers');
var applyForm = require('./olx/cimb-niaga-auto-finance/apply-form');
var completeForm = require('./olx/cimb-niaga-auto-finance/complete-form');
var provinces = require('./data/provinces');
var cities = require('./data/cities');
var cityMappings = require('./data/cityMappings');

var $body = $('body');
var $applyForm = $('#apply-form');
var $completeForm = $('#complete-form-wrapper');
var $errorBox = $('#error-box');

module.exports = {
  isMobile: window.innerWidth <= 480,
  isTablet: window.innerWidth <= 768 && window.innerWidth > 480,
  provinces: provinces,
  cities: cities,
  cityMappings: cityMappings,
  url: function (url) {
    return process.env.BASE_URL + url;
  },
  init: function () {
    // Initialize App
    $(document).ready(function () {
      // Handlers
      handlers.handleTabs();
      handlers.handleAutoCompleteCity();
      applyForm.ready();

      // Load Complete Form
      $completeForm.load(
          'pages/olx/cimb-niaga-auto-finance/complete-form.html',
          completeForm.ready
      );
    });
  },

  toggleCompleteForm: function () {
    $completeForm.toggleClass('hidden');
  },

  showError: function (msg) {
    $errorBox.find('p').html(msg);
    $errorBox.removeClass('hidden');
  },

  hideError: function () {
    $errorBox.find('p').html('');
    $errorBox.addClass('hidden');
  }
};
