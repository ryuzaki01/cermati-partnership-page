'use strict';

exports.JQUERY_DATE_PICKER = {
  accuracy: {
    month: 'month',
    year: 'year',
    date: 'date'
  },
  range: {
    year: '-80:+10' // Relative 80 years back from now and 10 years a head of now
  },
  format: {
    id: {
      date: 'dd/mm/yy',
      month: 'mm/yy',
      year: 'yy'
    },
    en: {
      date: 'mm/dd/yy',
      month: 'mm/yy',
      year: 'yy'
    }
  }
};
