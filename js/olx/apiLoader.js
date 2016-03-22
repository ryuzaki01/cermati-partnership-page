'use strict';

var $ = require('jquery');
var $form = $('#calculator-form');

var onError = function () {
  alert('Tidak dapat terhubung ke server cermati.');
};

module.exports = {
  init: function (cb) {
    var $areaSelect = $form.find('[name="location"]');
    var $brandSelect = $form.find('[name="brand"]');

    $.when(
      $.ajax({
        url: App.url('/api/widget/olx/area'),
        method: 'GET',
        success: function (response) {
          if (response.area && response.area.length > 0) {
            response.area.forEach(function (area) {
              $areaSelect.append('<option>' + area + '</option>');
            });
          }
        },
        error: onError,
        dataType: 'json'
      }),
      $.ajax({
        url: App.url('/api/widget/olx/brand'),
        method: 'GET',
        success: function (response) {
          if (response.brands && response.brands.length > 0) {
            response.brands.forEach(function (brand) {
              $brandSelect.append('<option value="' + brand.key + '">' + brand.label + '</option>');
            });
          }
        },
        error: onError,
        dataType: 'json'
      })
    ).done(function() {
      cb.call();
    });
  }
};