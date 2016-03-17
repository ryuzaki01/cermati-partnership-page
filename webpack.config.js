'use strict';

var webpack = require('webpack');
require('dotenv').load({path: '.env'});

var optimizerPlugins = [
  new webpack.optimize.DedupePlugin(),
  new webpack.optimize.AggressiveMergingPlugin(),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      sequences: true,
      dead_code: true,
      conditionals: true,
      booleans: true,
      unused: true,
      if_return: true,
      join_vars: true,
      drop_console: true,
      warnings: false
    },
    mangle: {
      except: ['$', 'exports', 'require']
    },
    sourceMap: process.env.NODE_ENV === 'staging',
    output: {
      comments: false
    }
  })
];

module.exports = {
  entry: {
    vendors: [
      'jquery',
      'ui',
      'lodash',
      'responsiveTabs'
    ],
    app: 'main'
  },
  output: {
    path: __dirname + '/dist/js/',
    filename: 'main.js'
  },
  resolve: {
    root: [
      __dirname + '/js/'
    ],
    alias: {
      jquery: 'jquery/jquery-2.1.1',
      ui: 'jquery-ui/jquery-ui',
      responsiveTabs: 'jquery-ui/jquery.responsiveTabs'
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.WEBPACK_NODE_ENV)
      }
    }),

    new webpack.ProvidePlugin({
      'window.jQuery': 'jquery',
      jQuery: 'jquery',
      $: 'jquery'
    }),
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
  ].concat(process.env.NODE_ENV === 'development' ? [] : optimizerPlugins),
  devtool: process.env.NODE_ENV === 'staging' ? 'source-map' : false
};
