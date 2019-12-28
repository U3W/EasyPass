console.log("Used Port " + process.env.PORT);
console.log("Mode " + process.env.NODE_ENV);

const worker = new Worker('worker.js');

let cache = [];
let initialized = false;

worker.addEventListener('message', initComplete, false);

function initComplete() {
    worker.removeEventListener('message', initComplete, false);

    function getEntry(id) {
        for (let i = 0; i < cache.length; i++) {
            if (cache[i]._id === id) {
                return i;
            }
        }
    }

    function all() {
        worker.postMessage(['all']);
    }

    function adapter() {
        worker.postMessage(['test', {'msg': 'adapter'}]);
    }

    function info() {
        worker.postMessage(['test', {'msg': 'info'}]);
    }

    function tsave() {
        const name = document.getElementById("tname").value;
        const amount = document.getElementById("tamount").value;
        worker.postMessage(['save', {'name': name, 'amount': amount}]);
    }

    function tremove(id) {
        const index = getEntry(id);
        const theid = cache[index]._id;
        const therev = cache[index]._rev;
        worker.postMessage(['remove', {'selector': {'_id': theid, '_rev': therev}}]);
    }

    function tupdate(id) {
        const index = getEntry(id);
        const theid = cache[index]._id;
        const identification = theid.split("::")[0];
        const therev = cache[index]._rev;
        const newName = document.getElementById("tname" + identification).value;
        const newAmount = document.getElementById("tamount" + identification).value;
        worker.postMessage(['update', {'_id': theid, '_rev': therev, 'name': newName, 'amount': newAmount}]);
    }

    const table = document.getElementById("tt");

    worker.addEventListener('message', function(e) {
        const cmd = e.data[0];
        const data = e.data[1];
        switch (cmd) {
            case 'all': // Get all values from database
                cache = [];
                table.innerHTML = "";
                for (let i = 0; i < data.length; i++) {
                    const doc = data[i].doc;
                    if (doc.name !== undefined) {
                        cache.push(doc);
                        const identification0 = doc._id;
                        table.insertRow(-1).innerHTML = '<tr><td><div id="' + "tid" + identification0 +'">' + doc._id + '</div></td>' +
                            '<td><input type="text" id="' +  "tname" + identification0  +'" value="' + doc.name +'"></td>' +
                            '<td><input type="text" id="' +  "tamount" + identification0  +'" value="' + doc.amount +'"></td>' +
                            '<td><button id="' + "tupdate"+ identification0  +'">Update</button></td></tr>' +
                            '<td><button id="' + "tremove"+ identification0  +'">Remove</button></td></tr>';
                        document.getElementById("tupdate"+ identification0 ).addEventListener('click', function() { tupdate(identification0 ) } , false);
                        document.getElementById("tremove"+ identification0 ).addEventListener('click', function() { tremove(identification0 ) } , false);
                    }
                }
                initialized = true;
                break;
            case 'save':
                cache.push(data);
                const identification = data._id.split("::")[0];
                table.insertRow(-1).innerHTML = '<tr><td><div id="' + "tid" + identification +'">' + data._id + '</div></td>' +
                    '<td><input type="text" id="' +  "tname" + identification  +'" value="' + data.name +'"></td>' +
                    '<td><input type="text" id="' +  "tamount" + identification  +'" value="' + data.amount +'"></td>' +
                    '<td><button id="' + "tupdate"+ identification  +'">Update</button></td></tr>' +
                    '<td><button id="' + "tremove"+ identification  +'">Remove</button></td></tr>';
                document.getElementById("tupdate"+ identification ).addEventListener('click', function() { tupdate(identification ) } , false);
                document.getElementById("tremove"+ identification ).addEventListener('click', function() { tremove(identification ) } , false);
                break;
            case 'update':
                const index = getEntry(data._id);
                cache[index] = data;
                const identification2 = data._id.split("::")[0];
                document.getElementById("tname" + identification2).value = data.name;
                document.getElementById("tamount" + identification2).value = data.amount;
        }
    }, false);

    document.getElementById("tsave").addEventListener('click', tsave);
    document.getElementById("init").addEventListener('click', init);

    all();
}