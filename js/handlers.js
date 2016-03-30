'use strict';

var $ = require('jquery');
var maskMoneyUtil = require('./utils/maskMoney');
var DATE = require('./utils/constants').JQUERY_DATE_PICKER;
require('ui');
require('responsiveTabs');

module.exports = {
  handleMoneyMask: function () {
    $.each($('.mask-money'), function () {
      var $self = $(this);
      var $parentForm = $(this).closest("form");
      maskMoneyUtil.maskMoney($self);
      $parentForm.on('submit', function () {
        maskMoneyUtil.unMask($self);
      });
      $(document).ajaxComplete(function() {
        maskMoneyUtil.maskMoney($self);
      });
    })
  },
  handleQueryString: function ($form) {
    var query = document.location.search.replace('?', '');
    query = query.split('&');
    if (query.length > 1) {
      query.forEach(function (q) {
        var keyVal = q.split('=');
        console.log(keyVal[1]);
        $form.find('[name=' + keyVal[0] + ']').val(decodeURIComponent(keyVal[1])).trigger('change');
      });
      $form.trigger('submit');
    }
    window.history.replaceState(null, document.title, './');
  },

  handleTabs: function () {
    var $tabs = $('.tabs');
    $tabs.responsiveTabs({
      rotate: false,
      collapsible: 'accordion',
      setHash: true
    });
  },

  handleAutoCompleteCity: function () {
    var $input = $('input[name="city"]');

    if ($input.length > 0) {
      $input.autocomplete({
        delay: 0,
        minLength: 0,
        source: function (request, response) {
          var regex = new RegExp(request.term, 'i');
          response($.map(App.cities, function (item) {
            if (regex.test(item.name) || request.term === '') {
              return {
                label: item.name,
                value: item.name
              };
            }
          }));
        },
        select: function (event, ui) {
          $input.val(ui.item.label);
          return false;
        },
        open: function () {
          if (App.isMobile) {
            $('body').scrollTop($(this).offset().top - 100);
          }
        },
        change: function (event, ui) {
          var validated = false;

          if (ui.item && ui.item !== '') {
            // Validate city
            for (var i in App.cities) {
              if (ui.item.value === App.cities[i].name) {
                validated = true;
              }
            }
          }

          if (!validated) {
            $('<div>').html('Harap pilih kota yang tersedia.').dialog({
              title: 'Error',
              modal: true,
              close: function () {
                $(this).dialog('destroy').remove();
              },
              buttons: [{
                text: 'OK',
                click: function () {
                  $(this).dialog('close');
                }
              }]
            });
            $input.val('');
            $input.autocomplete('search', '');
          }
        }
      }).autocomplete('instance')._renderItem = function (ul, item) {
        return $('<li>')
            .append('<div class="drop-item">' + item.label + '</div>')
            .appendTo(ul);
      };

      $input.focus(function () {
        $input.val('');
        $input.autocomplete('search', '');
      });
    }
  },

  handleDatePicker : function () {
    $('.date-picker').each(function () {
      var $dateInput = $(this);
      var accuracy = $dateInput.data('accuracy') || DATE.accuracy.date;
      var format = DATE.format.id[accuracy] || DATE.format.id.date;
      var yearRange = $dateInput.data('yearRange') || DATE.range.year;
      var defaultValue = $dateInput.data('defaultValue') || new Date();
      var datePickerConfigs = {
        dateFormat: format,
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        yearRange: yearRange,
        closeText: 'Tutup',
        defaultDate: defaultValue
      };

      $dateInput.datepicker(datePickerConfigs);

      // Hides datepicker date calendar if the accuracy is month or year.
      // NOTE: datepicker uses the same element (singleton) for multiple calendars.
      if (accuracy === DATE.accuracy.month || accuracy === DATE.accuracy.year) {
        // Assign datepicker element after we trigger $dateInput.datepicker(datePickerConfigs)
        var $datePickerDiv = $('#ui-datepicker-div');

        // Datepicker always resets the value everytime we do $dateInput.datepicker('option', ..., ...)
        // so we need to preserve the originalValue
        var originalValue = $dateInput.val() === "" ? defaultValue : $dateInput.val();

        $dateInput.datepicker('option', 'onChangeMonthYear', function (year, month) {
          // Javascript Date's month uses zero based index
          $dateInput.val($.datepicker.formatDate(format, new Date(year, month - 1, 1)));

          // Trigger change manually, because setting the $dateInput.val() programmatically
          // does not trigger change event.
          $dateInput.trigger('change');
        });

        // Always reset the margin everytime datepicker is closed
        $dateInput.datepicker('option', 'onClose', function () {
          // Because datepicker has transition, we need to wait until the transition has ended
          setTimeout(function () {
            $datePickerDiv.css('margin-top', '0');
          }, 300);
        });

        // Set back the originalValue to $dateInput
        $dateInput.datepicker('setDate', originalValue);

        $dateInput.on('focus', function () {
          var $closeDatePickerButton = $datePickerDiv.find('button.ui-datepicker-close');
          var $year = $datePickerDiv.find('.ui-datepicker-year');
          var $month = $datePickerDiv.find('.ui-datepicker-month');

          // Hide the date calendar everytime user clicks on the input
          $datePickerDiv.find('.ui-datepicker-calendar').hide();

          if (accuracy === DATE.accuracy.year) {
            $datePickerDiv.find('.ui-datepicker-month').hide();
          }

          // Only show datepicker `Done` button when accuracy is not `date`
          $closeDatePickerButton.show();

          // If user clicks the close button without picking the date then the
          // selected date won't get set, because the only trigger that set the date is
          // the handler that we set on event `onChangeMonthYear`, the other one is
          // the jquery datepicker's date cells, but on accuracy month or year we hide
          // the date cells.
          $closeDatePickerButton.one('click', function () {
            var date = new Date($year.val(), $month.val());
            $dateInput.val($.datepicker.formatDate(format, date));
          });

          // If we only show month and year, datepicker still calculates the date calendar's
          // margin-top that we hide, so we need to set the margin-top programmatically.
          if ($datePickerDiv.offset().top < $(this).offset().top) {
            $datePickerDiv.css('margin-top', '180px');
          } else {
            $datePickerDiv.css('margin-top', '0');
          }
        });
      }
    });
  }
};
