'use strict';

module.exports = {
  handleTabs: function () {
    var $tabs = $('.tabs');
    $tabs.responsiveTabs({
      rotate: false,
      startCollapsed: 'accordion',
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
  }
};
