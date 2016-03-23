'use strict';

var $ = require('jquery');
var _ = require('lodash');
var $form = $('#calculator-form');
var loanSlug = 'kredit-mobil-bekas-cimb-niaga-auto-finance-olx';

var onError = function () {
  alert('Tidak dapat terhubung ke server cermati');
};

module.exports = {
  init: function (cb) {
    var $brandSelect = $form.find('[name="brand"]');
    var $areaSelect = $form.find('[name="location"]');

    $brandSelect.html('<option value=""> - Pilih Model Mobil -</option>');
    $areaSelect.html('<option value=""> - Pilih Wilayah -</option>');

    $.when(
      $.ajax(App.url('/api/widget/olx/area'), {
        method: 'GET',
        data: {
          loan: loanSlug
        },
        dataType: 'json'
      }),
      $.ajax(App.url('/api/widget/olx/brand'), {
        method: 'GET',
        data: {
          loan: loanSlug
        },
        dataType: 'json'
      })
    ).done(function(response1, response2) {
      var area = _.get(response1, '0.area', []);
      var errorArea = _.get(response1, '0.error', false);
      area.forEach(function (area) {
        $areaSelect.append('<option>' + area + '</option>');
      });

      if (errorArea) {
        console.debug(errorArea);
      }

      var brands = _.get(response2, '0.brands', []);
      var errorBrand = _.get(response2, '0.error', false);
      brands.forEach(function (brand) {
        $brandSelect.append('<option value="' + brand.key + '">' + brand.label + '</option>');
      });

      if (errorBrand) {
        console.debug(errorBrand);
      }
      cb.call();
    }).fail(onError);
  }
};