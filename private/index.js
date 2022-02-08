const socket = io();
let endpoint;
let username;
let messageInput = document.getElementById("message-input");
let chatMessages = document.getElementById("chat-messages");

socket.on("PRIVATE_READY", (name) => {
  if (name == null) {
    window.alert("Not signed in!");
    window.location.href = "https://ChatWebsite.computer78601.repl.co/login/";
  }
  name = name.replace("cookieName=", "");
  username = name;
  endpoint = window.location.pathname;
  endpoint = endpoint.replace("/dm/", "").slice(0, -1);
  if (endpoint === username) {
    window.alert("Hey stop trying to DM yourself!");
    window.location.href = "https://ChatWebsite.computer78601.repl.co";
    return;
  }
  socket.emit("PRIVATE_START", endpoint, username);
});


// Will be replaced once database is done.
socket.on("USER_OFFLINE", () => {
  window.alert("the user you tried to DM is offline at the moment! They will not receive a notification.");
})

document.getElementById('message-send').addEventListener("click", () => {
  if (messageInput.value.replaceAll("\n", "") == "") {
    return;
  }
  if (messageInput.value.split("\n").length > 6) {
    window.alert("Max lines are 5!");
    messageInput.value = '';
    return;
  }
  let message = messageInput.value;
  messageInput.value = '';
  socket.emit("PRIVATE_SEND", message, username, endpoint);
})

socket.on("PRIVATE_MESSAGE", (obj) => {
  if (obj.receiver == username) {
    
  } else if (obj.sender == username) {

  } else {
    return;
  }
  let update = obj;
  let date = new Date(Date.now());
  update.sender = update.sender.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  update.message = update.message.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  update.message = update.message.split("\n").join("<br>")
  while (true) {
    if (update.message.endsWith("<br>")) {
      update.message = update.message.slice(0, -4);
    } else {
      break;
    }
  }
  while (true) {
    if (update.message.startsWith("<br>")) {
      update.message = update.message.slice(4, update.message.length);
    } else {
      break;
    }
  }
  if (update.sender === username) {
    chatMessages.innerHTML += `<p>&lt;You&gt;<b>${update.sender}</b>: ${update.message}</p><p style="font-size: 2vh;">${date.toLocaleTimeString()} ${date.toDateString()}</p>`;
  } else if (update.message.includes("@"+username)) {
    chatMessages.innerHTML += `<p style="background-color: #FFFF99; opacity: 0.7;;" onclick=launchDM("${update.sender}")><b>${update.sender}</b>: ${update.message}</p><p style="font-size: 2vh;">${date.toLocaleTimeString()} ${date.toDateString()}</p>`;
    pings++;
    document.title = "PINGS "+ pings;
  } else {
    chatMessages.innerHTML += `<p onclick=launchDM("${update.sender}")><b>${update.sender}</b>: ${update.message}</p><p style="font-size: 2vh;">${date.toLocaleTimeString()} ${date.toDateString()}</p>`;
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
})

socket.on("PRIVATE_USER_EXIT", usrname => {
  if (usrname === "" || usrname == null) {
    return;
  } else if (usrname != endpoint) {
    return;
  }
  usrname = usrname.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  chatMessages.innerHTML += `<p><span style=" font-family: 'Anton', sans-serif; margin-top: 0.7vh;" >${usrname}</span> <span style="color: #ff1900; font-family: 'Anton', sans-serif;" > went offline.</span></p>`;
});