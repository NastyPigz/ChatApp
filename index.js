const express = require("express");
const socketio = require("socket.io");

const app = express();
app.use(express.static("template"));
app.use('/dm/:user', express.static("private"));
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
let connected = {};
let users = [];

io.on("connection", socket => {
  let username = socket.handshake.headers["x-chatapp-username"];
  let url = socket.handshake.headers.referer;
  socket.emit("READY", username);
  // socket.on("join", () => {
  //   io.emit("GLOBAL_USER_ADD", username);
  // });
  // ^^^ above would work once sign up / login is done.
  socket.on("join", (name) => {
    username = name;
    io.emit("GLOBAL_USER_ADD", name);
  });
  socket.on("send", (message, name) => {
    io.emit("MESSAGE_CREATE", {
      sender: name,
      message: message,
    });
  });
  // vvv below would work once sign up / login is done.
  // socket.on("send", (message) => {
  //   io.emit("MESSAGE_CREATE", {
  //     sender: username,
  //     message: message, // Maybe replace characters?
  //   });
  // });
  socket.on("disconnect", () => {
    io.emit("GLOBAL_USER_EXIT", username);
  });
});
