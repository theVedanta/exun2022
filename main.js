if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = process.env.PORT || 4000;
const dbURI = process.env.DB_URL;
const cookieParser = require("cookie-parser");
const cors = require("cors");
const Grid = require("gridfs-stream");
const http = require("http");
const stats = require("./models/stats");
const { isObject } = require("util");
const server = http.createServer(app)
const workerrr = require("./models/worker");
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:8100",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});
const schedule = require('node-schedule');
const jwt = require("jsonwebtoken");
var Workers = {}

// DB CONNECTION
async function connectDB() {
    await mongoose.connect(dbURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    });
    
}
connectDB();

// SETTINGS
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + "/public"));
app.use(cors());

// GRIDFS SETTINGS
const conn = mongoose.connection;
let gfs;
conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("fs");
});

// ROUTES
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.redirect("/worker"));

app.use("/dashboard", require("./routes/dashboard"));

app.use("/worker", require("./routes/worker"));

app.use("/api", require("./routes/api"));

// Imgs
app.get("/img/:filename", async (req, res) => {
    try {
        let file = await gfs.files.findOne({ filename: req.params.filename });
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
    } catch (err) {
        res.redirect("/err");
        console.log(err);
    }
});

app.get("/err", (req, res) => {
    res.send("<h1>Some error occurred</h1>");
});

app.get("*", (req, res) => {
    res.send("Error 404, Not found");
});

var Workers = []
// !socket connection
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('task',async (data) => {
        
        console.log(data);
        // convert json to string 
        let task = JSON.stringify(data);
        // get current date
        let date = new Date();
        // store only day and month and year
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        date = `${day}/${month}/${year}`;
        // if date already exists update data
        let taskExists = await stats.findOne({ date: date });
        if (taskExists) {
            await stats.updateOne({ date: date }, { $set: { data: task } });
        } else {
            // else create new document
            let newTask = new stats({
                data: task,
                date: date,
            });
            await newTask.save();
        }

    });

    socket.on('join', (data) => {
        console.log('join');
        let date = new Date();
        // store only day and month and year
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        date = `${day}/${month}/${year}`;
        // find data from date 
        stats.findOne({ date: date }, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                // if data exists send it to client
                if (data) {
                    socket.emit('data', data.data);
                }
            }
        });
    });

    socket.on('login', async (data) => {
        jwt.verify(data, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                console.log(err);
            } else {
                var uid = decoded.id;
                // find data from mongo db
                let user = await workerrr.findOne({ _id: uid });
                var urname = user.username;
                socket.emit('user', {token: data, user: urname});
            }
        });
    });

    socket.on('wrkr', (data) => {
        // if jwt is valid 
        console.log('worker');
        let date = new Date();
        // store only day and month and year
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        date = `${day}/${month}/${year}`;
        // get data 
        stats.findOne({ date: date }, (err, data) => {
            var taskss = JSON.parse(data.data);
            socket.emit('data', taskss);
        });
        
    });

    socket.on('getdata', (data) => {
        console.log('getdata');
        let date = new Date();
        // store only day and month and year
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        date = `${day}/${month}/${year}`;
        // get data 
        stats.findOne({ date: date }, (err, data) => {
            var taskss = JSON.parse(data.data);
            socket.emit('yeledata', taskss);
        });
        
    });

});




// !Socket + express 
server.listen(port, () => {
    console.log("listening on port " + port)
})

// sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}