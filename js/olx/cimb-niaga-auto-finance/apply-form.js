'use strict';

var _ = require('lodash/fp');
var $ = require('jquery');

var inputSelector = _.template('input[name=<%= name %>]');
var inputValue = function ($form, name) {
  var selector = inputSelector({
    name: name
  });
  return $form.find(selector).val();
};

var defaultProductOptions = [
  {key: 'insuranceType', value: 'All Risk'}
];

var formData = _.defaults({
  productId: '56dd564889df9d09ac91b40a', // TODO: hardcode this with CNAF product id in db production.
  product: 'Retail Financing Mobil Bekas CIMB Niaga Auto Finance',
  productType: 'Kredit Mobil Bekas',
  institution: 'CIMB Niaga Auto Finance',
  url: window.location.href
});

exports.ready = function () {
  var $form = $('#apply-form');
  var productOptionNames = [
    'loanAmount',
    'tenure',
    'downPayment'
  ];
  var productOptions = _.flowRight(
    defaultProductOptions.concat.bind(defaultProductOptions),
    _.map(function (key) {
      return {key: key, value: inputValue($form, key)};
    })
  );

  var onError = function (response) {
    var errorMessages = _.get('responseJSON.data', response);
    var status = _.get('responseJSON.status', response);

    if (status === false) {
      $form.find('.validation-error').addClass('hidden');

      _.each(function (value, key) {
        var selector = inputSelector({
          name: key
        });
        $form.find(selector).parent().find('.validation-error').removeClass('hidden');
      }, errorMessages);
    } else {
      // Server error
    }
  };

  $form.on('submit', function (event) {
    event.preventDefault();

    var postData = formData({
      name: inputValue($form, 'name'),
      email: inputValue($form, 'email'),
      city: inputValue($form, 'city'),
      phoneNumber: inputValue($form, 'phoneNumber'),
      productOptions: productOptions(productOptionNames)
    });

    $.ajax({
      url: 'http://localhost:3000/api/sales-lead/save',
      context: 'application/json',
      method: 'POST',
      data: postData,
      beforeSend: _.noop,
      success: _.noop,
      error: onError,
      complete: _.noop
    });
  });
};
