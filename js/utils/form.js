'use strict';

var _ = require('lodash/fp');

/**
 * Extract form data from the given JQuery form element
 *
 * @param JQuery<Element>
 * @returns {Object}
 */
exports.extractFormData = function ($form) {
  return _.reduce(function (acc, input) {
    var $input = $form.find('#' + input.name);
    var customInput = $input.data('custom-input');
    var value = input.value;
    var setValue = _.set(input.name, _, acc);

    if ($input.hasClass('has-custom-input') && customInput === value) {
      var $customInputText = $input.parent().find('.custom-input-text');
      var customInputValue = $customInputText.val();
      console.log(customInputValue);

      // If the value is empty then set empty string.
      if (_.isEmpty(customInputValue)) {
        return setValue('');
      }

      return setValue(value + ':' + customInputValue);
    }

    return setValue(value);
  }, {}, $form.serializeArray());
};
