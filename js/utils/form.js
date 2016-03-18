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
    return _.set(input.name, input.value, acc);
  }, {}, $form.serializeArray());
};
