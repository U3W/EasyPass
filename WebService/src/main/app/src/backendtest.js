const worker = new Worker('worker.js');

function sayHI2() {
    worker.postMessage({'cmd': 'start', 'msg': 'adapter'});
}

function unknownCmd2() {
    worker.postMessage({'cmd': 'foobard', 'msg': '???'});
}

function stop2() {
    worker.postMessage({'cmd': 'stop', 'msg': 'Bye'});
}

worker.addEventListener('message', function(e) {
    document.getElementById('result2').textContent = e.data;
}, false);

document.getElementById("hi2").addEventListener('click', sayHI2);
document.getElementById("unknown2").addEventListener('click', unknownCmd2);
document.getElementById("stop2").addEventListener('click', stop2);