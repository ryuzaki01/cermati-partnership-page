'use strict';

var $ = require('jquery');
var _ = require('lodash/fp');
var sprintf = require('sprintf-js').sprintf;

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

var prepareSubmissionHandler = function () {
  var fillFormAPI = _.flowRight(
    App.url,
    sprintf.bind(sprintf, '/api/applications/%s/fill-form')
  );

  var $form = $('#complete-form');
};

exports.ready = function () {
  prepareSelectOptions();
  prepareSubmissionHandler();
};
