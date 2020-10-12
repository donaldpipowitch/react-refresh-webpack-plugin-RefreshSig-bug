const { join } = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { MiniHtmlWebpackPlugin } = require('mini-html-webpack-plugin');
const { dev } = require('webpack-nano/argv');
const { WebpackPluginServe } = require('webpack-plugin-serve');
const React = require('react');
const { renderToString } = require('react-dom/server');

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

const entry = {
  app: ['./src/index.tsx'],
  initial: ['./src/components/loading-page.tsx'],
};
if (dev) entry.app.push('webpack-plugin-serve/client');

const output = {
  path: join(process.cwd(), 'dist'),
  filename: '[name].[chunkhash].js',
  chunkFilename: '[name].[chunkhash].lazy.js',
  libraryTarget: 'umd', // needed so I can require the initial chunk here?
};
if (dev) {
  output.filename = '[name].js';
  output.chunkFilename = '[name].lazy.js';
}

const plugins = [
  new MiniHtmlWebpackPlugin({
    chunks: ['app', 'initial'],
    template(data) {
      const initialEntry = data.js.pop();
      // not on file system yet - how do I get it?
      const { LoadingPage } = require(`${output.path}/${initialEntry}`);  
      const renderedLoadingPage = renderToString(
        React.createElement(LoadingPage)
      );
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>DEMO</title>
        </head>
        <body>
          <div
            id="initial"
            style="
              position: fixed;
              top: 0;
              width: 100vw;
              background: white;
              z-index: 1;
            "
          >
            ${renderedLoadingPage}
          </div>
          <div id="app"></div>
          ${data.js.map((entry) => `<script src="${entry}"></script>`)}
        </body>
        </html>
      `;
    },
  }),
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
