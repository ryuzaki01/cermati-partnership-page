'use strict';

var _ = require('lodash/fp');
var $ = require('jquery');
var scrollUtil = require('../utils/scroll');

/**
 * A function that creates a validation error jquery element with
 * the given messages.
 *
 * @param messages - An array or string of validation messages.
 * @returns {JQuery<Element>}
 */
var validationError = function (messages) {
  if (!_.isArray(messages)) {
    messages = [messages];
  }

  return $('<div class="validation-error"></div>').html(messages.join('<br>'));
};

module.exports = {
  init: function () {
    var $form = $('#calculator-form');
    var $simulationResult = $('#simulation-result');
    var $simulationLoading = $('#simulation-loading');

    var onError = function (response) {
      response = response.responseJSON;
      if (response && response.error) {
        _.chain(response.error)
            .omit('messageArray')
            .each(function (messageObj, inputId) {
              var messages = _.values(messageObj);
              var $inputContainer = $form.find('[name="' + inputId + '"]').parent();
              $inputContainer
                  .addClass('has-error')
                  .append(validationError(messages));
            })
            .value();

        var $firstError = $form.find('.has-error').eq(0);
        if ($firstError.length > 0) {
          scrollUtil.scrollToElement($firstError);
        }
      } else {
        App.showError('Tidak dapat terhubung dengan server cermati.', true);
        scrollUtil.scrollToElement($('#calculator-error-box'));
      }
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

      // Reset Error Input
      $form.find('.validation-error').remove();
      $form.find('.has-error').removeClass('has-error');

      // Hide Error Box
      App.hideError(true);


      $simulationResult.hide();
      $simulationLoading.show();

      // Reset Error Input
      $form.find('.has-error').removeClass('has-error');

      $.ajax({
        url: App.apiUrl('/api/widget/olx'),
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