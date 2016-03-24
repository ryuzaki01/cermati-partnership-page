'use strict';

var $ = require('jquery');

var lastDot = 0;

module.exports.maskMoney = function ($mask) {
  var ctrlKeyDown = false;
  $mask.on('focus', function () {
    if (parseInt($mask.val()) === 0) {
      $mask.select();
    }
  });
  $mask.on('keydown', function (e) {
    if (e.keyCode === 17) {
      ctrlKeyDown = true;
    }
  });
  $mask.on('keyup paste', function (e) {
    if (e.keyCode === 17) {
      ctrlKeyDown = false;
    }

    var ignoredCode = (e.keyCode === 37 || e.keyCode === 39);
    if (!ignoredCode) {
      var deleteCode = e.keyCode == 8;
      var selectStart = $mask[0].selectionStart;
      var selectEnd = $mask[0].selectionEnd;
      var val = parseInt($mask.val().replace(/\./g, "")) || 0;
      var maskedVal = val.toFixed(0)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      $mask.val(maskedVal);

      var selectionVal = maskedVal.substr(0, selectStart);
      var dotCount = (selectionVal.split('.').length - 1);
      var lastDotPosition = (lastDot < dotCount) ? (dotCount - lastDot) : 0;
      $mask[0].setSelectionRange(
          (selectStart + lastDotPosition),
          (selectEnd + lastDotPosition)
      );
      lastDot = dotCount;
    }
  });

  // Trigger onece
  $mask.trigger('paste');
};

module.exports.unMask = function ($input) {
  $input.val($input.val().replace(/\D/g, ''));
}