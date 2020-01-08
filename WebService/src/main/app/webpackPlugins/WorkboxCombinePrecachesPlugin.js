const os = require('os');

/**
 * The EasyPass project has two entry points — one for the main app, one for the worker.
 * This means every entry creates an individual precache for the service-worker.
 * The problem is, the workbox plugin always overwrites the service-worker file and
 * the plugin is being executed two times because of the two entry points.
 * That means, one precache will always be missing. To fix this, the precache import
 * of the worker entry is manually added to the service-worker file at the top.
 */
class WorkboxCombinePrecachesPlugin {

    constructor(mode, fileName) {
        this.mode = mode;
        if (fileName === null) {
            this.fileName = 'service-worker.js';
        } else this.fileName = fileName;
    }

    static amount = undefined;

    static counter = 0;

    static flag = false;

    static cache = [];

    static precaches = "";

    static addPrecache(precache) {
        this.precaches += precache + os.EOL;
    }

    apply(compiler) {
        compiler.hooks.emit.tap('WorkboxSavePrecachePlugin', compilation => {
            if (WorkboxCombinePrecachesPlugin.amount === undefined) {
                throw "You need to set the amount of precaches of the WorkboxCombinePrecachesPlugin through " +
                "`WorkboxCombinePrecachesPlugin.amount = your_amount` before using the plugin.";
            }
            else if (this.mode === 'save') {
                if (WorkboxCombinePrecachesPlugin.counter >= WorkboxCombinePrecachesPlugin.amount) {
                    throw "When calling the WorkboxCombinePrecachesPlugin on the last precache you need " +
                    "to use the mode `combine`";
                } else {
                    const content = compilation.assets[this.fileName].source();
                    const precacheImport = content.substring(0, content.search(';')+1);
                    WorkboxCombinePrecachesPlugin.cache.push(precacheImport);
                    delete compilation.assets[this.fileName];
                    WorkboxCombinePrecachesPlugin.counter++;
                    if (WorkboxCombinePrecachesPlugin.counter + 1 === WorkboxCombinePrecachesPlugin.amount) {
                        WorkboxCombinePrecachesPlugin.flag = true;
                    }
                }
            } else if (this.mode === 'combine') {
                if (WorkboxCombinePrecachesPlugin.flag === false) {
                    this.wait();
                }
                if (WorkboxCombinePrecachesPlugin.counter + 1 === WorkboxCombinePrecachesPlugin.amount) {
                    WorkboxCombinePrecachesPlugin.cache.forEach(item =>
                        WorkboxCombinePrecachesPlugin.addPrecache(item));

                    const serviceWorker = WorkboxCombinePrecachesPlugin.precaches +
                        compilation.assets[this.fileName].source();

                    compilation.assets[this.fileName] = {
                        source: function() {
                            return serviceWorker;
                        },
                        size: function() {
                            return serviceWorker.length;
                        }
                    };

                } else {
                    throw "Expected more precaches."
                }
            } else {
                throw 'Unknown mode: ' + this.mode;
            }
        });
    }

    wait() {
        let i = 0;
        while(!WorkboxCombinePrecachesPlugin.flag) {
            if (i === 0) console.log("Waiting for precaches...");
            i++;
            if (i === 1000000000) i = 0;
        }
    }

}

module.exports = WorkboxCombinePrecachesPlugin;