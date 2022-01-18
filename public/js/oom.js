
var socket = io('http://localhost:4000');
var oompano = 0; 
// get cookie with name "token"
var token = getCookie("auth-token");

// connect to socket server
socket.on('connect', function() {
    console.log('Connected to server');
    socket.emit('login', token);
});

socket.on('user', (data) => {
    console.log(data);
    if (token == data.token) {
        oompano = data.name
        socket.emit('getdata', {})
    }
});

socket.on('yeledata', (data) => {
    console.log(data);
    
});


function getCookie(name){
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}