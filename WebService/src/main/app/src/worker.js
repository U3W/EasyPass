importScripts("bower_components/pouchdb/dist/pouchdb.min.js");
import("../pkg").then(wasm => {
    let worker = new wasm.Worker();
    self.addEventListener('message', async function(e) {
        const data = e.data;
        switch (data.cmd) {
            case 'test':
                worker = await wasm.process(worker, data.msg);
                let msg = worker.get_output();
                self.postMessage('Testing' + data.msg + ': ' + msg);
                break;
            case 'save':
                worker = await wasm.save(worker, data.db, data.data);
                break;
            case 'start':
                worker = await wasm.process(worker, data.msg);
                let msg2 = worker.get_output();
                self.postMessage('WORKER STARTED: ' + msg2);
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

