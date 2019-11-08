importScripts("bower_components/pouchdb/dist/pouchdb.min.js");
import("../pkg").then(wasm => {
    let worker = new wasm.Worker();
    self.addEventListener('message', async function(e) {
        const data = e.data;
        switch (data.cmd) {
            case 'start':
                worker = await wasm.process(worker, "adapter");
                let msg = worker.get_output();
                self.postMessage('WORKER STARTED: ' + msg);
                break;
            case 'stop':
                self.postMessage('WORKER STOPPED: ' + data.msg + '. (buttons will no longer work)');
                self.close(); // Terminates the worker.
                break;
            default:
                self.postMessage('Unknown command: ' + data.msg);
        }
    }, false);
});

