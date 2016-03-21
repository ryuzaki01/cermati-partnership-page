'use strict';

var $ = require('jquery');
var _ = require('lodash/fp');
var sprintf = require('sprintf-js').sprintf;
var formUtil = require('../../utils/form');
var scrollUtil = require('../../utils/scroll');

var defaultOption = $.bind($, '<option value="">-- Silahkan Pilih --</option>');

/**
 * A function that creates a `<option>` jquery element with
 * the given label and value.
 *
 * @param label - Option label.
 * @param value - Option value.
 * @returns {JQuery<Element>}
 */
var option = function (label, value) {
  return $('<option></option>')
    .text(label)
    .attr('value', value);
};

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

/**
 * A function that returns a list of province options.
 * @returns {Array}
 */
var provinces = function () {
  return App.provinces.map(function (province) {
    return option(province, province);
  });
};

/**
 * A function that returns a list of city options.
 * @returns {Array}
 */
var cities = function (province) {
  return App.cityMappings[province].map(function (city) {
    return option(city, city);
  });
};

var prepareSelectOptions = function () {
  $('select[data-dependents]').each(function () {
    var $select = $(this);
    var dependents = $select.data('dependents').map(function (selector) {
      return $('#' + selector);
    });
    $select.append(provinces());

    $select.on('change', function () {
      var value = $select.val();

      dependents.forEach(function ($dependent) {
        var mapping = $dependent.data('selectOptionMapping');

        if (mapping === 'city') {
          var options = [defaultOption()].concat(cities(value));
          $dependent.html(options);
        }
      });
    });
  });
};

var prepareDateInputFields = function () {
  $('.date-picker').each(function () {
    var $dateInput = $(this);
    var accuracy = $dateInput.data('accuracy');

    if (!_.isEmpty(accuracy) && accuracy !== 'date') {

    } else {
      $dateInput.datepicker();
    }
  });
};

var prepareSubmissionHandler = function () {
  // TODO: remove below code
  App.data = {
    signInToken: 'f37b8c07a72f8eca093d95dcf364f16463b0feb370a08165005ac7adc6f7a7946891f16be1ba58ba27f2ca4c5898d7a93fb8c74830f836ad9f0f2883e9bac6f87f2afef641dad5d45f181568d482e4b75af3091e50684b40ce83962f7cc10cdf',
    orderId: 'IIL2OZ10'
  };

  var fillFormAPI = App.url(sprintf(
    '/api/applications/%s/fill-form?%s',
    App.data.orderId,
    $.param({token: App.data.signInToken})
  ));

  var $form = $('#complete-form');
  App.toggleCompleteForm();

  var onSuccess = function (response) {
    if (response.success === false) {
      _.chain(response.messages)
        .omit('messageArray')
        .each(function (messageObj, inputId) {
          var messages = _.values(messageObj);
          var $inputContainer = $('#' + inputId).parent();
          $inputContainer
            .addClass('has-error')
            .append(validationError(messages));
        })
        .value();

      scrollUtil.scrollToElement($form.find('.has-error').eq(0));
    }
  };

  var onError = function () {
    App.showError('Tidak dapat terhubung dengan server cermati.');
  };

  var submissionHandler = function (event) {
    event.preventDefault();

    // Hide error messages
    var $inputContainersWithErrors = $form.find('.has-error');
    $inputContainersWithErrors.find('.validation-error').remove();
    $inputContainersWithErrors.removeClass('has-error');

    $.ajax({
      url: fillFormAPI,
      method: 'POST',
      data: formUtil.extractFormData($form),
      success: onSuccess,
      error: onError
    });
  };

  $form.on('submit', submissionHandler);
};

exports.ready = function () {
  prepareSelectOptions();
  prepareDateInputFields();
  prepareSubmissionHandler();
};
