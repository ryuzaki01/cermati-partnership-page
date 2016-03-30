'use strict';

var $ = require('jquery');
window.$ = $;

var _ = require('lodash');
var handlers = require('./handlers');
var calculatorForm = require('./olx/calculator');
var applyForm = require('./olx/cimb-niaga-auto-finance/apply-form');
var completeForm = require('./olx/cimb-niaga-auto-finance/complete-form');
var apiLoader = require('./olx/cimb-niaga-auto-finance/apiLoader');
var provinces = require('./data/provinces');
var cities = require('./data/cities');
var cityMappings = require('./data/cityMappings');
var arrayUtil = require('./utils/array');

var $completeForm = $('#complete-form-wrapper');
var $errorBox = $('#error-box');
var $calculatorErrorBox = $('#calculator-error-box');

module.exports = {
  isMobile: window.innerWidth <= 480,
  isTablet: window.innerWidth <= 768 && window.innerWidth > 480,
  provinces: provinces,
  cities: cities,
  cityMappings: cityMappings,
  url: function (url) {
    return process.env.BASE_URL + url;
  },
  apiUrl: function (url) {
    return process.env.API_URL + url;
  },
  init: function () {
    // Initialize App
    $(document).ready(function () {
      // Handlers
      apiLoader.init(function () {
        handlers.handleQueryString($('#calculator-form'));
      });
      handlers.handleDatePicker();
      handlers.handleMoneyMask();
      handlers.handleTabs();
      handlers.handleAutoCompleteCity();
      calculatorForm.init();
      applyForm.ready();

      // Load Complete Form
      $completeForm.load(
        'pages/olx/cimb-niaga-auto-finance/complete-form-v2.html',
        completeForm.ready
      );
    });
  },

  toggleCompleteForm: function () {
    $completeForm.toggleClass('hidden');
  },

  renderSimulationTable: function (data) {
    var items = [
      [
        'Total DP Bayar',
        'Angsuran'
      ]
    ];
    data.forEach(function (d) {
      items[d.tenure] = [];
      if (d.error) {
        items[d.tenure].push(d.error);
        items[d.tenure].push('-');
      } else {
        items[d.tenure].push(d.totalDownPayment);
        items[d.tenure].push(d.averagePayment);
      }
    });

    items = arrayUtil.transpose(items);

    var tableTemplate = _.template($("#simulation-table-template").html());
    $('#simulation-table').find('tbody').html(tableTemplate({items: items}));
  },

  showError: function (msg, isCalculatorError) {
    var $box = $errorBox;
    if (isCalculatorError) {
      $box = $calculatorErrorBox;
    }
    if (!_.isArray(msg)) {
      msg = [msg];
    }

    $box.find('p').html(msg.join('<br/>'));
    $box.removeClass('hidden');
  },

  hideError: function (isCalculatorError) {
    var $box = $errorBox;
    if (isCalculatorError) {
      $box = $calculatorErrorBox;
    }

    $box.find('p').html('');
    $box.addClass('hidden');
  }
};
