var host = window.location.host;
var socket = io(host);
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
        // last 2 digits of data.user
        oompano = data.user.slice(-2);
        socket.emit('getdata', {})
    }
});

socket.on('yeledata', (data) => {
    console.log(data);
    // get hour of the day
    var date = new Date();
    var hour = date.getHours();
    if (hour < 17 && hour > 8) {
        var taskno = "task" + hour;
        var tasks = data[taskno];
        // for each element in array task 
        var n = 0 
        for (var i = 0; i < tasks.length; i++) {
            if(oompano < tasks[i][1] + n) {
                document.getElementById('current task').innerHTML = tasks[i][0];
            } else {
                n = n + tasks[i][1]
            }
        }
    }
});


function getCookie(name){
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}