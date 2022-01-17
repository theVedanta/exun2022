// import socket io 
var socket = io('http://localhost:4000');


// connect to socket server
socket.on('connect', function() {
    console.log('Connected to server');
});


// on click of element with id edit 
document.getElementById('edit').onclick = function() {
    // if amount of divs inside the div with id 'distribution' is 0 add a div with class task 
    if (document.getElementById('distribution').getElementsByClassName('task').length != 6) {
        var task = document.createElement('div');
        task.className = 'task';
        document.getElementById('distribution').appendChild(task);
    }
}