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
        this.fileName = fileName;
    }

    static flag = false;

    static setFlag(state) {
        this.flag = state;
    }

    static precaches = "";

    static addPrecache(precache) {
        this.precaches += precache + os.EOL;
    }

    apply(compiler) {
        compiler.hooks.emit.tap('WorkboxSavePrecachePlugin', compilation => {
            if (this.mode === 'save') {
                console.log("wow");
                const content = compilation.assets[this.fileName].source();
                const precacheImport = content.substring(0, content.search(';')+1);
                WorkboxCombinePrecachesPlugin.addPrecache(precacheImport);
                console.log(WorkboxCombinePrecachesPlugin.precaches);
                WorkboxCombinePrecachesPlugin.setFlag(true)
            }
            else if (this.mode === 'combine') {
                if (this.fileName === null) {
                    this.fileName = 'service-worker.js';
                }
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

                console.log(compilation.assets[this.fileName].source());
            }
            else {
                this.check();
                console.log(WorkboxCombinePrecachesPlugin.precaches);
            }
        });
    }

    check() {
        while(!WorkboxCombinePrecachesPlugin.flag) {
            console.log("1");
        }
        console.log("2");
    }

}

module.exports = WorkboxCombinePrecachesPlugin;