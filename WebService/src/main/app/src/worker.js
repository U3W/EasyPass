importScripts("modules/pouchdb/dist/pouchdb.min.js");
importScripts("modules/pouchdb/dist/pouchdb.find.min.js");
importScripts("modules/easypass-lib/dist/easypass-lib.js");
importScripts("modules/kdbxweb/kdbxweb.min.js");
import("../../rust/pkg").then(wasm => {

    // Set node mode
    setNodeMode(process.env.NODE_ENV);
    const kek = async () => {
        console.log(await getDatabaseURL());
    };
    kek();

    // Create new backend and start it
    const app = new wasm.Backend();
    app.start();


    /**
     * JS-Code is deprecated.
     * Still left for code snippets that still need to be ported to WASM.
     */


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