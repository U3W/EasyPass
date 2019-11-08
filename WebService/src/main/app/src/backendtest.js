const worker = new Worker('worker.js');

function adapter() {
    worker.postMessage({'cmd': 'test', 'msg': 'adapter'});
}

function info() {
    worker.postMessage({'cmd': 'test', 'msg': 'info'});}

function saveUser() {
    const name = document.getElementById("userdataname").value;
    const passwd = document.getElementById("userdatapasswd").value;
    worker.postMessage({'cmd': 'save', 'db': 'UserDB', 'data': {'name': name, 'passwd': passwd}})
}

function saveGroup() {
    const name = document.getElementById("groupdataname").value;
    const passwd = document.getElementById("groupdatapasswd").value;
    worker.postMessage({'cmd': 'save', 'db': 'GroupDB', 'data': {'name': name, 'passwd': passwd}})
}

worker.addEventListener('message', function(e) {
    document.getElementById('result2').textContent = e.data;
}, false);

document.getElementById("adapter").addEventListener('click', adapter);
document.getElementById("info").addEventListener('click', info);

document.getElementById("usersave").addEventListener('click', saveUser);
document.getElementById("groupsave").addEventListener('click', saveGroup);

