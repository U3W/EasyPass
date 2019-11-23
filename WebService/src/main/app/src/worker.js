importScripts("bower_components/pouchdb/dist/pouchdb.min.js");
importScripts("bower_components/pouchdb/dist/pouchdb.find.min.js");
import("../../rust/pkg").then(wasm => {

    fetch("http://localhost:8090/redirect").then(async function (response) {
        const url = await response.json();
        console.log(JSON.stringify(url));
        console.log(url.db);
        const pouchTest = new PouchDB(url.db);
        pouchTest.put({
            _id: 'mydoc3',
            title: 'Heroes3'
        }).then(function (response) {
            // handle response
        }).catch(function (err) {
            console.log(err);
        });
    });


    let worker = new wasm.Worker();
    //let test = PouchDB("UserDB");
    //let result = test.find({"selector":{"name": "Genesis"}});
    self.addEventListener('message', async function(e) {
        const data = e.data;
        switch (data.cmd) {
            case 'test':
                let msg = await worker.process(data.msg);
                self.postMessage(data.msg + ': ' + msg);
                break;
            case 'save':
                await worker.save(data.db, data.data);
                break;
            case 'find':
                let query = await worker.find(data.db, data.data);
                self.postMessage('Found documents: ' + JSON.stringify(query.docs));
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

