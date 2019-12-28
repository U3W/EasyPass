importScripts("modules/pouchdb/dist/pouchdb.min.js");
importScripts("modules/pouchdb/dist/pouchdb.find.min.js");
importScripts("modules/easypass-lib/dist/easypass-lib.js");
import("../../rust/pkg").then(wasm => {
    /**
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
    });*/
    const isReachable = async (url) => {
        const controller = new AbortController();
        const signal = controller.signal;
        const fetchPromise = fetch(url, {signal});
        // 5 second timeout:
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        fetchPromise.then(response => {
            //console.log("FULLFILL:" + response);
            return true;
        }).catch(() => {
            //console.log("ERROR: " + response);
            return false;
        });
    };

    //wasm.test2();


    let worker = new wasm.Worker();

    /**
    const sleep = async (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };
    const heartbeat = async () => {
        while (true) {
            if (navigator.onLine) {
                if (await isReachable('http://localhost:7000')) {
                    console.log('Service down')
                } else {
                    console.log("online");
                }
                //await isReachable('http://localhost:7000');
                console.log("online")
            } else {
                console.log("offline");
            }
            await worker.check({"selector":{"name": "Test"}});
            await sleep(5000);
        }
    };
    heartbeat();*/

    const heartbeat = async () => {
        if (navigator.onLine) {
            if (await isReachable('http://localhost:7000')) {
                console.log('Online')
            } else {
                console.log("Service Down");
            }
        } else {
            console.log("Offline");
        }
        console.log("Hi!");
        await worker.check({"selector":{"name": "Test"}});
    };
    setAsyncInterval(heartbeat, 3000);


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

