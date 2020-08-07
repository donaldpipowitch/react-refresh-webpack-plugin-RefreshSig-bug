const { join } = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { dev } = require('webpack-nano/argv');
const { WebpackPluginServe } = require('webpack-plugin-serve');

const mode = dev ? 'development' : 'production';
const watch = dev;
if (!dev) process.env.NODE_ENV = 'production';

const babelConfig = require('./babel.config');
if (dev) babelConfig.plugins.push(require.resolve('react-refresh/babel'));

const rules = [
  {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
    options: babelConfig,
  },
];

const entry = ['./src/index.tsx'];
if (dev) entry.push('webpack-plugin-serve/client');

const output = {
  path: join(process.cwd(), 'dist'),
  filename: '[name].[chunkhash].js',
  chunkFilename: '[name].[chunkhash].lazy.js',
};
if (dev) {
  output.filename = '[name].js';
  output.chunkFilename = '[name].lazy.js';
}

const plugins = [
  new HtmlWebpackPlugin({ template: 'src/index.html' }),
  new CleanWebpackPlugin({
    // doesn't play nice with webpack-plugin-serve
    cleanStaleWebpackAssets: false,
  }),
];
if (dev) {
  plugins.push(
    new ReactRefreshWebpackPlugin({
      // it looks like the error overlay does not only appear on build errors,
      // but also general errors which makes debugging error boundaries hard
      // (that' why we deactivated it)
      overlay: false,
    }),
    new WebpackPluginServe({
      host: 'localhost',
      port: 4200,
      static: output.path,
      progress: false,
      historyFallback: true,
    })
  );
}

const resolve = {
  extensions: ['.ts', '.tsx', '.js'],
};

const stats = {
  // copied from `'minimal'`
  all: false,
  modules: true,
  maxModules: 0,
  errors: true,
  warnings: true,
  // our additional options
  builtAt: true,
};

const devtool = dev ? 'cheap-module-eval-source-map' : 'source-map';

module.exports = {
  mode,
  watch,
  entry,
  output,
  module: { rules },
  plugins,
  resolve,
  stats,
  devtool,
};
