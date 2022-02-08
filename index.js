const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")
const socketio = require("socket.io");
const path = require('path');
const app = express();
const database = {
  admin: "admin"
};

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/', express.static("template"));
app.use('/login', function (req, res, next) {
  let cookie = req.cookies.cookieName;
  if (cookie != undefined) {
    res.redirect("https://ChatWebsite.computer78601.repl.co");
  } else {
    next();
  }
})
app.get('/logout', (req, res) => {
  let cookie = req.cookies.cookieName;
  let refer = req.headers.referer;
  if (!refer) {
    res.send("You must be redirected from https://ChatWebsite.computer78601.repl.co");
    return;
  }
  if (refer.toLowerCase() != "https://chatwebsite.computer78601.repl.co/") {
    console.log(refer);
    res.send("You must be redirected from https://ChatWebsite.computer78601.repl.co");
    return;
  }
  if (cookie == undefined) {
    res.send("You never logged in mate");
  } else {
    res.cookie('cookieName', null, { maxAge: 0, httpOnly: true });
    res.send("Successfully logged out. Please refresh your existing chat page to re-login");
  }
})
app.use('/dm/:user', express.static("private"));
app.use('/stupid', express.static("stupid"));
app.use('/admin', express.static("admin"));
app.use('/login', express.static("signup"));
app.post('/signup', function(req, res) {
  let data = req.body;
  if (database[data.uname]) {
    if (data.psw === database[data.uname]) {
      if (data.remember === true) {
        res.cookie('cookieName',data.uname, { maxAge: 900000, httpOnly: true });
      } else {
        res.cookie('cookieName',data.uname, { maxAge: 5000, httpOnly: true });
      }
      res.send({accepted: true, message: data.uname});
    } else {
      res.send({accepted: false, message: "Password Incorrect"});
    }
  } else {
    res.send({accepted: false, message: "Not a valid username"});
  }
});
//signup is actually login verify
app.post('/create', function(req, res) {
  let data = req.body;
  if (database[data.uname]) {
    res.send({accepted: false, message: "Username taken."});
  } else {
    database[data.uname]=data.psw;
    if (data.remember === true) {
      res.cookie('cookieName',data.uname, { maxAge: 900000, httpOnly: true });
    } else {
      res.cookie('cookieName',data.uname, { maxAge: 5000, httpOnly: true });
    }
    res.send({accepted: true, message: data.uname});
  }
});

function removeA(arr) {
  let what, a = arguments, L = a.length, ax;
  while (L > 1 && arr.length) {
      what = a[--L];
      while ((ax= arr.indexOf(what)) !== -1) {
          arr.splice(ax, 1);
      }
  }
  return arr;
}

const server = app.listen(process.env.PORT || "8080", () => {
  console.log("Server Started!");
});

const io = socketio(server);
let users = [];
let pusers = [];

io.on("connection", socket => {
  let cookie = socket.handshake.headers["cookie"];
  let username = cookie;
  if (username != undefined) {
    username = username.replace("cookieName=", "");
  }
  let url = socket.handshake.headers.referer;
  let dms = false;
  if (users.includes(username)) {
    socket.emit("ALT");
  } else {
    if (url.toLowerCase().startsWith("https://chatwebsite.computer78601.repl.co/dm")) {
      socket.emit("PRIVATE_READY", cookie);
      dms=true;
    } else {
      socket.emit("READY", cookie, users);
    }
  }
  // GLOBAL CHAT
  socket.on("join", () => {
    if (!users.includes(username)) {
      users.push(username);
    }
    io.emit("GLOBAL_USER_ADD", username);
  });
  socket.on("send", (message) => {
    io.emit("MESSAGE_CREATE", {
      sender: username,
      message: message,
    });
  });
  // GLOBAL CHAT

  if (!users.includes(username)) {
    socket.on("disconnect", () => {
      removeA(users, username);
      io.emit("GLOBAL_USER_EXIT", username);
    });
  } else if (dms === true) {
    socket.on("disconnect", () => {
      removeA(pusers, username);
      io.emit("PRIVATE_USER_EXIT", username);
    });
  }

  // PRIVATE CHAT
  socket.on("PRIVATE_START", (uname, starter) => {
    if (!users.includes(uname) && !pusers.includes(uname)) {
      socket.emit("USER_OFFLINE");
    }
    if (!pusers.includes(starter)) {
      pusers.push(starter);
    }
    io.emit("PRIVATE_REQUEST", uname, starter);
  })

  socket.on("PRIVATE_SEND", (msg, usrname, endpoint) => {
    io.emit("PRIVATE_MESSAGE", {
      sender: usrname,
      message: msg,
      receiver: endpoint
    })
  })
  // PRIVATE CHAT
});
