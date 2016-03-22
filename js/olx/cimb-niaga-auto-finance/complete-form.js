'use strict';

var $ = require('jquery');
var _ = require('lodash/fp');
var sprintf = require('sprintf-js').sprintf;
var formUtil = require('../../utils/form');
var scrollUtil = require('../../utils/scroll');
var DATE = require('../../utils/constants').JQUERY_DATE_PICKER;

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

var prepareSelectFieldWithCustomInput = function () {
  $('select.has-custom-input').each(function () {
    var $select = $(this);
    var $customInputText = $select.parent().find('.custom-input-text').hide();
    var customInputValue = $select.data('custom-input');

    $select.on('change', function () {
      if ($select.val() !== customInputValue) {
        $customInputText.val('');
        $customInputText.hide();
        return;
      }

      $customInputText.show();
    });
  });
};

var prepareDateInputFields = function () {
  $('.date-picker').each(function () {
    var $dateInput = $(this);
    var accuracy = $dateInput.data('accuracy') || DATE.accuracy.date;
    var format = DATE.format.id[accuracy] || DATE.format.id.date;
    var yearRange = $dateInput.data('yearRange') || DATE.range.year;
    var datePickerConfigs = {
      dateFormat: format,
      changeMonth: true,
      changeYear: true,
      showButtonPanel: true,
      yearRange: yearRange,
      closeText: 'Tutup'
    };

    $dateInput.datepicker(datePickerConfigs);

    // Hides datepicker date calendar if the accuracy is month or year.
    // NOTE: datepicker uses the same element (singleton) for multiple calendars.
    if (accuracy === DATE.accuracy.month || accuracy === DATE.accuracy.year) {
      // Assign datepicker element after we trigger $dateInput.datepicker(datePickerConfigs)
      var $datePickerDiv = $('#ui-datepicker-div');

      // Datepicker always resets the value everytime we do $dateInput.datepicker('option', ..., ...)
      // so we need to preserve the originalValue
      var originalValue = $dateInput.val();

      $dateInput.datepicker('option', 'onChangeMonthYear', function (year, month) {
        // Javascript Date's month uses zero based index
        $dateInput.val($.datepicker.formatDate(format, new Date(year, month - 1, 1)));

        // Trigger change manually, because setting the $dateInput.val() programmatically
        // does not trigger change event.
        $dateInput.trigger('change');
      });

      // Always reset the margin everytime datepicker is closed
      $dateInput.datepicker('option', 'onClose', function () {
        // Because datepicker has transition, we need to wait until the transition has ended
        setTimeout(function () {
          $datePickerDiv.css('margin-top', '0');
        }, 300);
      });

      // Set back the originalValue to $dateInput
      $dateInput.val(originalValue);

      $dateInput.on('focus', function () {
        var $closeDatePickerButton = $datePickerDiv.find('button.ui-datepicker-close');
        var $year = $datePickerDiv.find('.ui-datepicker-year');
        var $month = $datePickerDiv.find('.ui-datepicker-month');

        // Hide the date calendar everytime user clicks on the input
        $datePickerDiv.find('.ui-datepicker-calendar').hide();

        if (accuracy === DATE.accuracy.year) {
          $datePickerDiv.find('.ui-datepicker-month').hide();
        }

        // Only show datepicker `Done` button when accuracy is not `date`
        $closeDatePickerButton.show();

        // If user clicks the close button without picking the date then the
        // selected date won't get set, because the only trigger that set the date is
        // the handler that we set on event `onChangeMonthYear`, the other one is
        // the jquery datepicker's date cells, but on accuracy month or year we hide
        // the date cells.
        $closeDatePickerButton.one('click', function () {
          var date = new Date($year.val(), $month.val());
          $dateInput.val($.datepicker.formatDate(format, date));
        });

        // If we only show month and year, datepicker still calculates the date calendar's
        // margin-top that we hide, so we need to set the margin-top programmatically.
        if ($datePickerDiv.offset().top < $(this).offset().top) {
          $datePickerDiv.css('margin-top', '180px');
        } else {
          $datePickerDiv.css('margin-top', '0');
        }
      });
    }
  });
};

var prepareSubmissionHandler = function () {
  var $formLoading = $('#completeform-loading');
  var $submitBtn = $('#completeform-submit');

  // TODO: remove below code
  // App.data = {
  //   signInToken: 'f37b8c07a72f8eca093d95dcf364f16463b0feb370a08165005ac7adc6f7a7946891f16be1ba58ba27f2ca4c5898d7a93fb8c74830f836ad9f0f2883e9bac6f87f2afef641dad5d45f181568d482e4b75af3091e50684b40ce83962f7cc10cdf',
  //   orderId: 'T7IGWUXO'
  // };

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

  var onComplete = function () {
    setTimeout(function () {
      $formLoading.hide();
      $submitBtn.show();
    }, 500);
  };

  var submissionHandler = function (event) {
    event.preventDefault();

    var fillFormAPI = App.url(sprintf(
      '/api/applications/%s/fill-form?%s',
      App.data.orderId,
      $.param({token: App.data.signInToken})
    ));

    // Show Loading
    $formLoading.show();
    $submitBtn.hide();

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
  prepareSelectFieldWithCustomInput()
  prepareSubmissionHandler();
};
