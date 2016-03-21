'use strict';

var _ = require('lodash/fp');
var sprintf = require('sprintf-js').sprintf;
var $ = require('jquery');

var inputSelector = sprintf.bind(sprintf, '[name=%s]');
var inputValue = function ($form, name) {
  var selector = inputSelector(name);
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
  var $discountBox = $('#discount-box');
  var $thankyouBox = $('#thankyou-box');

  var onError = function (response) {
    var errorMessages = _.get('responseJSON.data', response);
    var status = _.get('responseJSON.status', response);

    if (status === false) {
      if (!errorMessages.error) {
        _.each(function (value, key) {
          var selector = inputSelector(key);
          $form.find(selector).parent().addClass('has-error');
        }, errorMessages);
      } else {
        App.showError(errorMessages.error);
      }
    } else {
      App.showError('Tidak dapat terhubung dengan server cermati.');
    }
  };

  var onSuccess = function (response) {
    if (response.status === true) {
      App.data = response.data;
      $form.hide();
      $discountBox.show();
      $thankyouBox.show();
    } else {
      console.info('This should not happen, response is');
      console.info(response);
    }
  };

  $form.on('submit', function (event) {
    event.preventDefault();

    // Hide Error Box
    App.hideError();

    // Reset Error Input
    $form.find('.has-error').removeClass('has-error');

    var postData = formData({
      name: inputValue($form, 'name'),
      email: inputValue($form, 'email'),
      city: inputValue($form, 'city'),
      phoneNumber: inputValue($form, 'phoneNumber'),
      productOptions: {
        loanAmount: inputValue($form, 'loanAmount'),
        downPayment: inputValue($form, 'downPayment'),
        tenure: inputValue($form, 'tenure'),
        tenureUnit: inputValue($form, 'tenureUnit')
      }
    });

    $.ajax({
      url: App.url('/api/sales-lead/save'),
      context: 'application/json',
      method: 'POST',
      data: postData,
      beforeSend: _.noop,
      success: onSuccess,
      error: onError,
      complete: _.noop
    });
  });
};
