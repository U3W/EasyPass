const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyWebPackPlugin = require("copy-webpack-plugin");
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const WebpackOnBuildPlugin = require('on-build-webpack');
const os = require('os')
const path = require('path');
const fs = require('fs');
const Q = require('q');

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
      { from: "public", ignore: ["index.html"] }
    ]),
      /** ,
    new CopyWebPackPlugin([
      { from: "src/serviceWorker.js", to: "serviceWorker.js"}
    ])*/
    new WorkboxPlugin.InjectManifest({
      swSrc: './src/service-worker/service-main.js',
      include: [/\.wasm$/, /\.html$/, /\.js$/, /\.ico$/, /\.png$/, /\.jpeg$/]
      //clientsClaim: true,
      //skipWaiting: true,
      /**
      manifestTransforms: [
       // Add mappings used by Spring WebServer
       (originalManifest) => {
          const manifest = originalManifest.map(entry => {
            console.log(manifest);
            if (entry.url.startsWith('/index.html')) {
              entry.url = '/';
            } else if (entry.url.startsWith('/backendtest.html')) {
              entry.url = '/backendtest';
            }
            return entry;
          });
          const warnings = [];
          return {manifest, warnings};
        }
       ]*/
    })
  ],
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: '/'
  },
  devServer: {
    historyApiFallback: true,
  },
  mode: "production"
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
  plugins: [
    new CopyWebPackPlugin([
      { from: "bower_components", to: "bower_components" }
    ]),
    new WorkboxPlugin.InjectManifest({
      swSrc: './src/service-worker/service-main.js',
      swDest: 'tmp.txt',
      include: [/\.wasm$/, /\.html$/, /\.js$/, /\.ico$/, /\.png$/, /\.jpeg$/]
    }),
    new WebpackOnBuildPlugin(function(stats) {
      // TODO refactor this section
      function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

      function readFirstLine (path) {
        return Q.promise(function (resolve, reject) {
          var rs = fs.createReadStream(path, {encoding: 'utf8'});
          var acc = '';
          var pos = 0;
          var index;
          rs
              .on('data', function (chunk) {
                index = chunk.indexOf('\n');
                acc += chunk;
                index !== -1 ? rs.close() : pos += chunk.length;
              })
              .on('close', function () {
                resolve(acc.slice(0, pos + index));
              })
              .on('error', function (err) {
                reject(err);
              })
        });
      }

      async function combinePrecaches() {
        await sleep(600);

        const text = await readFirstLine('build/tmp.txt');

        const data = fs.readFileSync('build/service-main.js'); //read existing contents into data
        const fd = fs.openSync('build/service-main.js', 'w+');
        const buffer = new Buffer.from(text);
        console.log(buffer.toString());
        console.log(data.toString());
        //fs.writeSync(fd, buffer, 0, buffer.length, 0); //write new data
        //fs.writeSync(fd, data, 0, data.length, buffer.length); //append old data
        //fs.appendFileSync(fd, data);
        fs.appendFileSync(fd, text + os.EOL);
        fs.appendFileSync(fd, data);
        fs.close(fd);
        console.log(text);
      }

      combinePrecaches();
    }),
  ],
  mode: "production"
};

module.exports = [appConfig, workerConfig];
