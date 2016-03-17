'use strict';

var _ = require('lodash/fp');
var $ = require('jquery');

exports.ready = function () {
  var $form = $('#apply-form');
  var defaultProductOptions = [
    {key: 'insuranceType', value: 'All Risk'}
  ];

  var formData = _.defaults({
    productId: 'TODO: fill with real productId', // TODO: hardcode this with CNAF product id in db production.
    product: 'Retail Financing Mobil Bekas CIMB Niaga Auto Finance',
    productType: 'Kredit Mobil Bekas',
    institution: 'CIMB Niaga Auto Finance'
  });

  var inputSelector = _.template('input[name=<%= name %>]');

  var inputValue = function (name) {
    var selector = inputSelector({
      name: name
    });
    return $form.find(selector).val();
  };

  var productOptions = _.flowRight(
    defaultProductOptions.concat.bind(defaultProductOptions),
    _.map(function (key) {
      return {key: key, value: inputValue(key)};
    })
  );

  var productOptionNames = [
    'loanAmount',
    'tenure',
    'downPayment'
  ];

  var onError = function (response) {
    var errorMessages = _.get('responseJSON.data', response);
    var status = _.get('responseJSON.status', response);

    if (status === false) {
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
      name: inputValue('name'),
      email: inputValue('email'),
      city: inputValue('city'),
      phoneNumber: inputValue('phoneNumber'),
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
