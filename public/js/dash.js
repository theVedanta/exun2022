// import socket io 
var socket = io('http://localhost:4000');

// get todays date 
var today = new Date();
// get the date
var date = today.getDate()
// get the day of the week
var day = new Date().getDay();

// day number to day name
function dayname(day){
    switch(day){
        case 0:
            return 'Sunday';
        case 1:
            return 'Monday';
        case 2:
            return 'Tuesday';
        case 3:
            return 'Wednesday';
        case 4:
            return 'Thursday';
        case 5:
            return 'Friday';
        case 6:
            return 'Saturday';
    }
}


document.getElementById('datentime').innerHTML = " " + date + ' ' + dayname(day);

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

// run function every 1 min 
function setheight(){
    // get hours of day 
    var hours = new Date().getHours();
    console.log("hours")
    // if hours between 9 and 17 
    if (hours >= 9 && hours <= 17) {
        var min = new Date().getMinutes();
        hours = hours - 9 
        // convert hours to minutes 
        var hours = hours * 60
        // add minutes to hours
        var hours = hours + min
        var fraction = hours / 480
        var height = fraction * 72 
        height = height + 10
        document.getElementById('clock').style.top = height + '%'
    } else {
        document.getElementById('clock').style.display = 'none'
    }

    // run function every 1 min
    setTimeout(setheight, 60000);
}
setheight()
socket.on('schedulerdataa', (msg) =>{
    console.log(msg)
    var milk = msg.milk
    var milk_milk = 0.75 * (milk/100)
    var milk_cocoa = 0.25 * (milk/100)
    var milk_sugar = 0.75 * (milk/100)

    var dark = msg.dark
    var dark_milk = 0.5 * (dark/100)
    var dark_cocoa = 0.5 * (dark/100)
    var dark_sugar = 0.3 * (dark/100)

    var white = msg.white
    var white_milk = 0.8 * (white/100)
    var white_cocoa = 0.25 * (white/100)
    var white_sugar = 0.75 * (white/100)

    var totalsugar = milk_sugar + dark_sugar + white_sugar
    var totalcocoa = milk_cocoa + dark_cocoa + white_cocoa
    var totalmilk = milk_milk + dark_milk + white_milk
    totalmilk = totalmilk
    var task = 9 
    var used = 0
    var totalcocoa = totalcocoa / 3
    var totalsugar = totalsugar / 2
    console.log(totalmilk)
    while (totalmilk > 100){
        tasks["task" + task] = []
        tasks["task"+task].push(['raw_milk', 100])
        totalmilk -= 100
        task += 1
        tasks["task" + task] = []
    }
    
    tasks["task"+task].push(['raw_milk', totalmilk])
    used = totalmilk
    console.log(totalcocoa)
    while (totalcocoa > 100){
        
        tasks["task"+task].push(['raw_cocoa', 100 - used])
        totalcocoa -= 100-used 
        used = 0 
        task += 1
        tasks["task"+task] = []
    }
    if (100 - used < totalcocoa){
        tasks["task"+task].push(['raw_cocoa', 100 - used])
        
        totalcocoa -= 100-used
        task += 1
        used = 0
        tasks["task"+task] = []
    }
    tasks["task"+task].push(['raw_cocoa', Math.round(totalcocoa)])
    used = used + Math.round(totalcocoa)
    
    while (totalsugar > 100){
        
        tasks["task"+task].push(['raw_sugar', 100 - used])
        totalsugar -= 100-used 
        used = 0 
        task += 1
        tasks["task"+task] = []
    }
    
    if (100 - used < totalsugar){
        tasks["task"+task].push(['raw_sugar', 100 - used])
        
        console.log(totalsugar)
        totalsugar =totalsugar - (100-used)
        console.log("used = "+used)
        task += 1
        tasks["task"+task] = []
    }
    used = 0
    tasks["task"+task].push(['raw_sugar', Math.round(totalsugar)])
    used = used + Math.round(totalsugar)
    console.log(tasks)
    var totalchocs = msg.dark + msg.white + msg.milk
    var darkshare = msg.dark / totalchocs
    darkshare = darkshare * 80
    var whiteshare = msg.white / totalchocs
    whiteshare = whiteshare * 80
    var milkshare = msg.milk / totalchocs
    milkshare = milkshare * 80
    task += 1
    while (task < 17){
        tasks["task"+task] = []
        tasks["task"+task].push(['dark', Math.round(darkshare)])
        tasks["task"+task].push(['white', Math.round(whiteshare)])
        tasks["task"+task].push(['milk', Math.round(milkshare)])
        task += 1
    }
    assignvalues()
    socket.emit('task', tasks)
})

function suggest(){

}

function scheduler(){
 socket.emit('schedulerdata', {} )
}