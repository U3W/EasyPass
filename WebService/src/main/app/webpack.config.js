const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyWebPackPlugin = require("copy-webpack-plugin");
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const CombineWorkboxPrecachesPlugin = require('combine-workbox-precaches-plugin');
const os = require('os');
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const Q = require('q');
const Dotenv = require('dotenv-webpack');

let mode = "production";
let outputPath = "build";
let temporaryPrecache = 'tmp.txt';
CombineWorkboxPrecachesPlugin.amount = 2;

module.exports = (args, options) => {
  /**
   * Set compilation mode
   */
  mode = options.mode;
  console.log("Using mode '" + mode + "' for compilation...");
  if (mode === "development") {
    outputPath = "buildDev"
  }

  /**
   * Create .env file if it does not exist and load environment.
   */
  if (!fs.existsSync( '.env')) {
    fs.appendFileSync('.env', 'PORT=8080' + os.EOL);
    fs.appendFileSync('.env', 'OPEN=true'+ os.EOL);
  }
  const env = require('dotenv').config({path: __dirname + '/.env'}).parsed;

  /**
   * Configure React-App
   */
  const appConfig = {
    entry: {
      'index': './src/index.js',
      'backendtest': './src/backendtest.js'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: "html-loader"
            }
          ]
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
          loader: 'url-loader?limit=100000'
        }
      ]
    },
    plugins: [
      new HtmlWebPackPlugin({
        template: "./public/index.html",
        filename: "index.html",
        excludeAssets: [/backendtest.*.js/]
      }),
      new HtmlWebpackExcludeAssetsPlugin(),
      new HtmlWebPackPlugin({
        template: "./public/backendtest.html",
        filename: "backendtest.html",
        excludeAssets: [/index.*.js/]
      }),
      new HtmlWebpackExcludeAssetsPlugin(),
      new CopyWebPackPlugin([
        {from: "public", ignore: ["index.html"]}
      ]),
      new WorkboxPlugin.InjectManifest({
        swSrc: './src/service-worker/service-worker.js',
        include: [/\.wasm$/, /\.html$/, /\.js$/, /\.ico$/, /\.png$/, /\.jpeg$/, /\.json$/]
      }),
      new CombineWorkboxPrecachesPlugin('combine', null),
      new Dotenv()
    ],
    output: {
      path: path.resolve(__dirname, outputPath),
      publicPath: '/'
    },
    devServer: {
      historyApiFallback: true,
      writeToDisk: false,
      stats: 'errors-only',
      port: env.PORT,
      open: (env.OPEN === 'true' || env.OPEN === 'TRUE')
    },
    mode: "production"
  };

  /*
   * Configure WebWorker with WebAssembly
   */
  const workerConfig = {
    entry: "./src/worker.js",
    target: "webworker",

    resolve: {
      extensions: [".js", ".wasm"]
    },
    output: {
      path: path.resolve(__dirname, outputPath),
      publicPath: '/',
      filename: "worker.js"
    },
    plugins: [
      new CopyWebPackPlugin([
        {from: "modules/easypass-lib/dist/**"},
        {from: "modules/pouchdb/dist/**"}
      ]),
      // TODO exclude unnecessary bower components
      new WorkboxPlugin.InjectManifest({
        swSrc: './src/service-worker/service-worker.js',
        swDest: temporaryPrecache,
        include: [/\.wasm$/, /\.html$/, /\.js$/, /\.ico$/, /\.png$/, /\.jpeg$/, /\.json$/]
      }),
      new CombineWorkboxPrecachesPlugin('save', temporaryPrecache),
      new Dotenv()
     ],
    mode: "production"
  };

  return [appConfig, workerConfig];
};