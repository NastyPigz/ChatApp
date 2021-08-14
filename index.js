const express = require("express");
const socketio = require("socket.io");

const app = express();
app.use(express.static("template"));
app.use('/dm', express.static("private"));
app.use('/stupid', express.static("stupid"));
app.use('/admin', express.static("admin"));

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
let connected = [];
let users = [];

io.on("connection", socket => {
  let username = "Guest";
  let _ip = socket.handshake.headers["x-forwarded-for"];
  let same_ip = false;
  if (_ip != null) {
    if (connected.includes(_ip)) {
      same_ip = true;
    } else {
      connected.push(_ip);
    }
  }
  socket.emit("start", username, _ip, same_ip, users);
  socket.on("join", (name) => {
    io.emit("userjoin", name || "Guest");
    username=name;
    users.push(username)
  });
  socket.on("send", (message, user, ip) => {
    io.emit("update", {
      sender: user || "Guest",
      message: message.replace(/<[^>]*>?/gm, ''),
      ip: ip
    });
  });
  socket.on("disconnect", () => {
    io.emit("userleave", username || "Guest");
    if (!same_ip) {
      removeA(connected, _ip);
    }
    removeA(users, username);
  });
});
