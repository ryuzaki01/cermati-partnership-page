'use strict';

var $ = require('jquery');
var _ = require('lodash/fp');

var defaultOption = $.bind($, '<option value="">-- Silahkan Pilih --</option>');

var option = function (label, value) {
  return $('<option></option>')
    .text(label)
    .attr('value', value);
};

exports.ready = function () {
  var provinces = function () {
    return App.provinces.map(function (province) {
      return option(province, province);
    });
  };

  var cities = function (province) {
    return App.cityMappings[province].map(function (city) {
      return option(city, city);
    });
  };

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
