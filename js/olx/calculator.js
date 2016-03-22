'use strict';

var _ = require('lodash/fp');
var $ = require('jquery');
var scrollUtil = require('../utils/scroll');

module.exports = {
  init: function () {
    var $form = $('#calculator-form');
    var $simulationResult = $('#simulation-result');
    var $simulationLoading = $('#simulation-loading');

    var onError = function (response) {
      response = response.responseJSON;
      if (response && response.error) {
        App.showError(response.error, true);
      } else {
        App.showError('Tidak dapat terhubung dengan server cermati.', true);
      }

      scrollUtil.scrollToElement($('#calculator-error-box'));
    };

    var onSuccess = function (response) {
      if (response.simulation) {
        App.renderSimulationTable(response.simulation);
      } else {
        console.info('This should not happen, response is');
        console.info(response);
      }
      $simulationResult.show();
    };

    var onComplete = function() {
      $simulationLoading.hide();
    };

    $form.on('submit', function (event) {
      event.preventDefault();

      // Hide Error Box
      App.hideError(true);


      $simulationResult.hide();
      $simulationLoading.show();

      // Reset Error Input
      $form.find('.has-error').removeClass('has-error');

      $.ajax({
        url: App.url('/api/widget/olx'),
        method: 'GET',
        data: $form.serialize(),
        beforeSend: _.noop,
        success: onSuccess,
        error: onError,
        complete: onComplete,
        dataType: 'json'
      });
    })
  }
};