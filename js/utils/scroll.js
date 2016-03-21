'use strict';

var _ = require('lodash/fp');
var $htmlDocument;

/**
 * Scroll window to the given element
 * @param $element - The element to be scrolled to.
 * @param options
 * @param options.animationTime
 */
exports.scrollToElement = function ($element, options) {
  if (!$htmlDocument) {
    $htmlDocument = $('html, body');
  }

  var _options = _.extend({
    animationTime: 500
  }, options);

  $htmlDocument.animate({scrollTop: $element.offset().top - 50}, _options.animationTime);
};
