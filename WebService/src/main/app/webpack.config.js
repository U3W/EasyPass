const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyWebPackPlugin = require("copy-webpack-plugin");
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const WorkboxCombinePrechachesPlugin = require('./webpackPlugins/WorkboxCombinePrecachesPlugin');
const os = require('os');
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const Q = require('q');
const Dotenv = require('dotenv-webpack');
let mode = "production";
let outputPath = "build";
let pc = {flag: false};

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
   * Create .env file if it does not exist
   */
  if (!fs.existsSync( '.env')) {
    fs.appendFileSync('.env', 'PORT=8080' + os.EOL);
    fs.appendFileSync('.env', 'OPEN=true'+ os.EOL);
  }
  const env = require('dotenv').config({path: __dirname + '/.env'}).parsed;

  /**
   * Functions used for Service Worker configuration
   */
  const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  const readFirstLine = (path) => {
    return Q.promise(function (resolve, reject) {
      const rs = fs.createReadStream(path, {encoding: 'utf8'});
      let acc = '';
      let pos = 0;
      let index;
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
  };
  const combinePrecaches = async () => {
    while (!fs.existsSync(outputPath + '/service-worker.js')) {
      await sleep(100);
    }
    const missingPrecache = await readFirstLine(outputPath + '/tmp.txt');
    const serviceWorker = fs.readFileSync(outputPath + '/service-worker.js');
    // Concat second precache to the first
    let editPrecacheName = await readFirstLine(outputPath + '/service-worker.js');
    editPrecacheName = editPrecacheName.replace('importScripts("', "");
    editPrecacheName = editPrecacheName.substring(0, editPrecacheName.indexOf('",'));
    editPrecacheName = editPrecacheName.replace("undefined/", "").replace("/", "");
    let editPrecache = fs.readFileSync(outputPath + '/' + editPrecacheName).toString('UTF-8');
    editPrecache = editPrecache.replace("self.__precacheManifest = [", "self.__precacheManifest = self.__precacheManifest.concat([");
    editPrecache = editPrecache.replace("];", "]);");
    const epFd = fs.openSync( outputPath + '/' + editPrecacheName, 'w+');
    fs.appendFileSync(epFd, editPrecache);
    fs.closeSync(epFd);
    // Assemble service-worker file
    const fd = fs.openSync( outputPath + '/service-worker.js', 'w+');
    fs.appendFileSync(fd, missingPrecache + os.EOL);
    fs.appendFileSync(fd, serviceWorker);
    fs.closeSync(fd);
    if (mode === "production") {
      fs.unlinkSync( outputPath + '/tmp.txt');
    }
    return missingPrecache;
  };

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
      new WorkboxCombinePrechachesPlugin('combine', null),
      new Dotenv()
    ],
    output: {
      path: path.resolve(__dirname, outputPath),
      publicPath: '/'
    },
    devServer: {
      historyApiFallback: true,
      writeToDisk: true,
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
        {from: "modules", to: "modules"}
      ]),
      // TODO exclude unnecessary bower components
      new WorkboxPlugin.InjectManifest({
        swSrc: './src/service-worker/service-worker.js',
        swDest: 'tmp.txt',
        include: [/\.wasm$/, /\.html$/, /\.js$/, /\.ico$/, /\.png$/, /\.jpeg$/, /\.json$/]
      }),
      new WorkboxCombinePrechachesPlugin('save', 'tmp.txt'),
      new Dotenv(),
      {
        // Removes all files from the build directory before the build-process starts.
        apply: (compiler) => {
          compiler.hooks.beforeRun.tap('CleanUpBeforeBuild', (compilation) => {
            fsExtra.emptyDirSync(outputPath)
          });
        }
      },
      {
        apply: (compiler) => {
          compiler.hooks.emit.tap('FileListPlugin', compilation => {
            //console.log("kek");
            //console.log(pc);
            //console.log(pc.getContent());
          });
        }
      }
    ],
    mode: "production"
  };

  return [appConfig, workerConfig];
};

/**,
 {
        // The EasyPass project has two entry points — one for the main app, one for the worker.
        // This means every entry creates an individual precache for the service-worker.
        // The problem is, the workbox plugin always overwrites the service-worker file and
        // the plugin is being executed two times because of the two entry points.
        // That means, one precache will always be missing. To fix this, the precache import
        // of the worker entry is manually added to the service-worker file at the top.
        apply: (compiler) => {
          compiler.hooks.emit.tapAsync('FileListPlugin', (compilation, callback) => {
            const filelist = "kek\nkek!";
            // Insert this list into the webpack build as a new file asset:
            compilation.assets['filelist.md'] = {
              source: function() {
                return filelist;
              },
              size: function() {
                return filelist.length;
              }
            };

            //console.log(compilation.assets);

            callback();
          });

          compiler.hooks.afterEmit.tapAsync('ServiceWorkerPrecache', async (compilation, callback) => {
            await combinePrecaches();

            const filelist = "kek\nkek!";
            // Insert this list into the webpack build as a new file asset:
            compilation.assets['filelist.md'] = {
              source: function() {
                return filelist;
              },
              size: function() {
                return filelist.length;
              }
            };
            callback();
          });
          compiler.hooks.watchRun.tap('ServiceWorkerPrecache', async (compilation) => {
            await combinePrecaches();
          });
        }
      }*/