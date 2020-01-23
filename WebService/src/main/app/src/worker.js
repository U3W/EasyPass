importScripts("modules/pouchdb/dist/pouchdb.min.js");
importScripts("modules/pouchdb/dist/pouchdb.find.min.js");
importScripts("modules/easypass-lib/dist/easypass-lib.js");
import("../../rust/pkg").then(wasm => {

    console.log("kek2");

    let worker = null;
    let remoteInit = false;
    let authUrl = null;

    // Initialize Worker
    const init = async () => {
        let dbUrl = "";
        // Create connection to remote database if online
        // When offline, the remote setup will be done when a connection
        // is found
        if (navigator.onLine) {
            try {
                const url = await fetch("/database");
                authUrl = url;
                const response = await url.json();
                dbUrl = response.db;
                remoteInit = true;
            } catch (e) {
                console.error("No connection to EasyPass-Service");
                console.error("Starting in offline-mode")
            }
        }
        worker = new wasm.Worker(dbUrl);
        self.postMessage('initDone');
        heartbeat();
    };

    // Sets host for the remote database when app the goes online
    // Only called when the app is started in offline-mode
    const setRemote = async () => {
        try {
            const url = await fetch("/database");
            const response = await url.json();
            worker.set_remote(response.db);
            remoteInit = true;
        } catch (e) {
            if (process.env.NODE_ENV === "production") {
                console.error("No connection to EasyPass-Service");
                console.error("Resuming offline-mode")
            } else console.log("Using Offline-Mode");
        }
    };

    // Heartbeat function to keep data synced
    const heartbeat = () => {
        setAsyncInterval(async () => {
            if (navigator.onLine) {
                // If worker started in offline mode and now goes online
                // connect to the remote database
                if (!remoteInit) {
                    await setRemote();
                }
                if (await isReachable('http://localhost:7000')) {
                    console.log('Online')
                } else {
                    console.log("Service Down");
                }
                worker.set_service_status("online");
            } else {
                console.log("Offline");
                worker.set_service_status("offline");
            }
            try {
                console.log(JSON.stringify(await worker.check()));
                //await worker.check();
                const all = await worker.all_docs();
                self.postMessage(['all', all.rows]);
            } catch (e) {
                console.log(e);
            }
        }, 3000);
    };

    init();


    const registration = async (uname, masterkey) => {
        // TODO Moritz func call
        const pubkey = masterkey;
        const privkey = masterkey;
        const data = {
            "uname": uname,
            "publicKey": pubkey,
            "privateKey": privkey
        };
        const respone = await fetch(authUrl + "register", {
            method: `POST`,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    };

    const login = async (uname, masterkey) => {
        const data = { "uname": uname, "publicKey": "", "privateKey": ""};
        const respone = await fetch(authUrl + "challenge", {
            method: `POST`,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await respone.json();
        //
        // result.encryptedPrivateKey
        // TODO decrypt private key with masterkey
        const privkey = "";
        // result.encryptedChallenge
        // TODO decrypt challenge with private key
        // const challenge = result.encryptedChallenge;
        const decryptedChallenge = 'D_A_S___I_S_T___E_I_N_E___C_H_A_L_L_E_N_G_E';

        // TODO login
        const response2 = await fetch(authUrl + "login", {
            method: 'post',
            headers: new Headers({
                'Authorization': 'Basic '+btoa(uname + ':' + decryptedChallenge),
                'Content-Type': 'application/x-www-form-urlencoded'
            })
        });


    };

    self.addEventListener('message', async function(e) {
        const cmd = e.data[0];
        const data = e.data[1];
        switch (cmd) {
            case 'test':
                let msg = await worker.process(data.msg);
                self.postMessage(data.msg + ': ' + msg);
                break;
            case 'save':
                await worker.save(data);
                const ret = await worker.find({"selector":{"name": data.name }});
                const success = (ret !== null && ret !== undefined);
                // self.postMessage(['save', ret.docs[0]]);
                self.postMessage(['save', success]);
                break;
            case 'update':
                const updateReturn = await worker.update(data);
                if (updateReturn.ok === true) {
                    console.log("Update successfull");
                } else {
                    console.log("Update NOT successfull");
                }
                const newData = await worker.find({"selector":{"_id": data._id}});
                self.postMessage(['update', newData.docs[0]]);
                break;
            case 'remove':
                const rem = await worker.find(data);
                const result = await worker.remove(rem.docs[0]);
                break;
            case 'find':
                let query = await worker.find(data);
                self.postMessage('Found documents: ' + JSON.stringify(query.docs));
                break;
            case 'all':
                const all = await worker.all_docs();
                self.postMessage(['all', all.rows]);
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

