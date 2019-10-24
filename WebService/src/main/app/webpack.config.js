const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyWebPackPlugin = require("copy-webpack-plugin");
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');

const path = require('path');

// Configure React-App
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
      filename: "./index.html",
      excludeAssets: [/backendtest.*.js/]
    }),
    new HtmlWebpackExcludeAssetsPlugin(),
    new HtmlWebPackPlugin({
      template: "./public/backendtest.html",
      filename: "./backendtest.html",
      excludeAssets: [/index.*.js/]
    }),
    new HtmlWebpackExcludeAssetsPlugin(),
    new CopyWebPackPlugin([
      { from: "public", ignore: ["index.html"] }
    ])
  ],
  output: {
    path: path.resolve(__dirname, "build")
  }
};

// Configure WebWorker with WebAssembly
const workerConfig = {
  entry: "./src/worker.js",
  target: "webworker",

  resolve: {
    extensions: [".js", ".wasm"]
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "worker.js"
  },
  mode: "development"
};

module.exports = [appConfig, workerConfig];