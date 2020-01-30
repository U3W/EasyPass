importScripts("modules/pouchdb/dist/pouchdb.min.js");
importScripts("modules/pouchdb/dist/pouchdb.find.min.js");
importScripts("modules/easypass-lib/dist/easypass-lib.js");
import("../../rust/pkg").then(wasm => {


    let worker = null;
    let remoteInit = false;
    let authUrl = null;
    let clientInitialized = false;
    let mode = undefined;
    let deletedPasswords = new Map();

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
        self.addEventListener('message', clientInit, true);

        // Send client OK and wait for response in `clientInit` listener
        while (!clientInitialized) {
            self.postMessage('initDone');
            await sleep(500);
        }
    };

    init();

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
            try {
                if (navigator.onLine) {
                    // If worker started in offline mode and now goes online
                    // connect to the remote database
                    if (!remoteInit) {
                        await setRemote();
                    }
                    if (await isReachable('http://localhost:7000')) {
                        console.log('Online')
                    } else {
                        console.log(Date() + "Service Down");
                    }
                    worker.set_service_status("online");
                } else {
                    console.log("Offline");
                    worker.set_service_status("offline");
                }
                //console.log(JSON.stringify(await worker.check()));
                await worker.check();
                const all = deletePasswordsInEntries((await worker.all_docs()).rows);
                self.postMessage(['allEntries', all]);
            } catch (e) {
                console.log(e);
            }
        }, 3000);
    };

    const clientInit = (e) => {
        if(e.data === 'initAck') {
            clientInitialized = true;
            self.removeEventListener('message', clientInit, true);
            self.addEventListener('message', clientCall, true);
        }
    };

    const clientCall = async (e) => {
        const cmd = e.data[0];
        const data = e.data[1];

        if (mode === undefined) {
            mode = cmd;
            if (mode === 'dashboard') {
                // TODO Toggle heartbeat
                //  Refactor hearbeat: loop -> listeners
                //heartbeat();
                worker.heartbeat();
            }
        } else {
            switch (mode) {
                case 'index':
                    indexCall(cmd, data);
                    break;
                case 'dashboard':
                    dashboardCall(cmd, data);
                    break;
            }
        }

    };

    const indexCall = async (cmd, data) => {
        switch (cmd) {
            case 'unregister':
                mode = undefined;
                break;
            case 'echo':
                self.postMessage(['echo', data]);
                break;
        }
    };

    const dashboardCall = async (cmd, data) => {
        // TODO do postMessage in WebAssembly not js
        switch (cmd) {
            case 'unregister':
                mode = undefined;
                break;
            case 'savePassword':
                //const saveResult = await worker.save(data);
                //self.postMessage(['savePassword', saveResult]);
                await worker.save(data);
                break;
            case 'updatePassword':
                await worker.update(data);
                break;
            case 'deletePassword':
                const deletedPassword = (await worker.find({"selector":{"_id": data._id, "_rev": data._rev}})).docs[0];
                deletedPasswords.set(deletedPassword, false);
                const delCheck = await worker.remove(data._id, data._rev);
                setTimeout(async function() {
                    undoPasswordDelete(deletedPassword);
                }, 5000);
                self.postMessage(['deletePassword', delCheck]);
                break;
            case 'undoDeletePassword':
                const undoKey = [...deletedPasswords.keys()].find(entry => entry._id === data._id);
                deletedPasswords.set(undoKey, true);
                break;
            case 'getPassword':
            case 'getPasswordToClipboard':
                const encrypted = (await worker.find({"selector":{"_id": data._id, "_rev": data._rev}})).docs[0];
                // TODO call decryption
                const decrypted = encrypted;
                (cmd === 'getPassword') ?
                    self.postMessage(['getPassword', {_id: decrypted._id, passwd: decrypted.passwd}]) :
                    self.postMessage(['getPasswordToClipboard', {_id: decrypted._id, passwd: decrypted.passwd}]);
                break;
            case 'saveCategory':
                const catCheck = await worker.save(data);
                self.postMessage(['saveCategory', catCheck]);
                break;


            // TODO Remove legacy Worker API
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
    };

    const undoPasswordDelete = async (deletedPassword) => {
      const check = deletedPasswords.get(deletedPassword);
      if (check)  {
          delete deletedPassword._id;
          delete deletedPassword._rev;
          // TODO error handling?
          await worker.save(deletedPassword);
      }
      deletedPasswords.delete(deletedPassword);
    };

    /**
     * Build selector query for PouchDB to verify that data was added.
     */
    const buildSelector = (data) => {
        let selector = Object();
        Object.keys(data).forEach(e => {
            // TODO Worker - BuildSelector support Arrays?
            if (!Array.isArray(data[e]))
                selector[e] = data[e];
        });
        return selector
    };

    /**
     * Checks if element dataset exist in local database.
     */
    const elementExists = async (data) => {
        const ret = await worker.find({"selector": buildSelector(data)});
        return (ret.docs.length !== 0);
    };

    // TODO Define WebAssembly API with Field to exclude passwd: https://nolanlawson.github.io/pouchdb-find/
    /**
     * Delete password field in dataset.
     */
    const deletePasswordsInEntries = (data) => {
        const entries = [];
        data.forEach(e => {
           delete e.doc.passwd;
           entries.push(e.doc);
        });
        return entries;
    };


    /**
     ***********************
     *
     * Login & Registration
     *
     ***********************
     */

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

});


