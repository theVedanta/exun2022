
var socket = io('http://localhost:4000');

// get cookie with name "token"
var token = getCookie("auth-token");

// connect to socket server
socket.on('connect', function() {
    console.log('Connected to server');
});

socket.on('online', (msg) =>{
    socket.emit('wrkr', token)
});

function getCookie(name){
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}