// import socket io 
var socket = io('http://localhost:4000');


// connect to socket server
socket.on('connect', function() {
    console.log('Connected to server');
    socket.emit('join','joined')
});

socket.on('data', (msg) =>{
    // convert to json
    console.log(msg)
    tasks = JSON.parse(msg)

    console.log(tasks)
    assignvalues()
})

var tasks = {
    task9: [],
    task10: [],
    task11: [],
    task12: [],
    task13: [],
    task14: [],
    task15: [],
    task16: []
}

// on click of element with id edit 
document.getElementById('edit9').onclick = function() {
    dothething(9)
}
document.getElementById('edit10').onclick = function() {
    dothething(10)
}
document.getElementById('edit11').onclick = function() {
    dothething(11)
}
document.getElementById('edit12').onclick = function() {
    dothething(12)
}
document.getElementById('edit13').onclick = function() {
    dothething(13)
}
document.getElementById('edit14').onclick = function() {
    dothething(14)
}
document.getElementById('edit15').onclick = function() {
    dothething(15)
}
document.getElementById('edit16').onclick = function() {
    dothething(16)
}


function assignvalues(){
    // go through all elements of the dictionary tasks
    for (let key in tasks) {
        array = tasks[key]
        // if the length of the array is greater than 0
        if (array.length > 0) {
            // go through all elements of the array
            var innrhtml = ''
            for (let i = 0; i < array.length; i++) {
                // if string is 5 characters long get last letter else get last 2 
                var lastletter = key.substring(key.length - 1)

                // get the div with id distribution + lastletter 
                var div = document.getElementById('distribution' + lastletter);
                // add a div to that div with class task
                innrhtml += `<div class="task ${array[i][0]}" style="width:${array[i][1]}%" onClick = "editbox('${array[i][0]}','${key}')" title="${array[i][1]}% ${array[i][0]}"><h1>` + array[i][0] + '<div class="line"></h1></div>';
                
            }
            console.log('distribution' + lastletter)
            div.innerHTML = innrhtml;
        }
    }
}

function dothething(number){
    var task = "task" + number
    if (tasks[task].length != 6) {
        // add the 2nd value of the array inside tasks[task9] array to sum
        var sum = 0  
        for (let i = 0; i < tasks[task].length; i++) {
            sum += tasks[task][i][1];
        }
        if (sum < 90) {
            tasks[task].push(['unnassigned', 10]);
        console.log(tasks[task])
        assignvalues()
        } else {
            alert('You have reached the limit of 90%');
        }

    }
    socket.emit('task', tasks)
}

function editbox(name,number){
    // window input 
    var input = prompt('Enter the task name', 'Task name');
    // if input is not null
    if (input != null) {
        var input2 = prompt('Enter the percentage', 'Percentage');
        // convert to int
        var input2 = parseInt(input2)
        // if input2 is not null
        if (input2 != null) {
            array = tasks[number]
            // go through all elements of the array
            for (let i = 0; i < array.length; i++) {
                // if percentage = 0 remove the array with the name 
                if (input2 == 0 && array[i][0] == name) {
                    tasks[number].splice(i, 1);
                    assignvalues()
                }

                // if the name of the task is equal to the input
                else if (array[i][0] == name) {
                    // change the name of the task
                    array[i][0] = input
                    // change the percentage of the task
                    array[i][1] = input2
                    assignvalues()
                    socket.emit('task', tasks)
                    break;
                }
            }
        }
    }
}