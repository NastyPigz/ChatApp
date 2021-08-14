let joinChat = document.getElementById("join-chat");
let usernameInput = document.getElementById("username-input");
let chatBox = document.getElementById("chat-box");
let chatMessages = document.getElementById("chat-messages");
let messageInput = document.getElementById("message-input");
let messageSend = document.getElementById("message-send");
let clearBtn = document.getElementById("clear");
let joinedBool = false;
let oldusername;
let uniqueIP;
let usersList = [];
let shiftClick = false;
let enterClick = false;
let shiftEnter = false;
let pings = 0;

const socket = io();
window.onload = () => {
  document.title="CHAT";
}
document.onmousemove = () => {
  document.title="CHAT";
}
document.onkeydown = () => {
  document.title="CHAT";
}

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

messageInput.addEventListener("keyup", function(event) {
  if (event.shiftKey) {
    shiftClick=false;
  }
  if (event.keyCode === 13) {
    enterClick=false;
    if (!shiftEnter) {
      event.preventDefault();
      document.getElementById("message-send").click();
    }
  }
  if ((!shiftClick) && (!enterClick)) {
    shiftEnter = false;
  }
});

messageInput.addEventListener("keydown", event => {
  if (event.shiftKey) {
    shiftClick = true;
  }
  if (event.keyCode == 13) {
    enterClick = true;
  }
  if (shiftClick && enterClick) {
    shiftEnter=true;
  }
})

socket.on("start", (username, ip, _bool, users) => {
  if (_bool) {
    window.location.href = "https://ChatWebsite.computer78601.repl.co/stupid"
  }
  uniqueIP = ip;
  usersList = users;
  usersList.forEach((username) => {
    document.getElementById("list").innerHTML  += `<p id="person">${username}</p><br><br>`;
  })
  function alwaysActive(original) {
    if (usernameInput.value != undefined && usernameInput.value != null && usernameInput.value != "") {
      joinChat.style.fontSize = '5vh'
      joinChat.innerHTML = `Join as ${usernameInput.value}`;
      setTimeout(alwaysActive, 1, original);
    } else {
      joinChat.style.fontSize = '6.3vh'
      joinChat.innerHTML = `Join`;
      setTimeout(alwaysActive, 1, original);
    }
  }
  joinChat.innerHTML = `Join as ${username}`;
  oldusername = username;
  setTimeout(alwaysActive, 1, username);
  setTimeout(usernameTask, 0, username);
});

clearBtn.addEventListener("click", (e) => {
  chatMessages.innerHTML = "";
})

const usernameTask = (original) => {
  if (usernameInput.value != oldusername) {
    joinedBool=false;
  }
  setTimeout(usernameTask, 0, original)
}

joinChat.addEventListener("click", (e) => {
  if (joinedBool === true) {
    window.alert("You already joined!");
    return;
  }
  if (usernameInput.value.length <1) {
    window.alert("Please choose a username longer than a single character!");
    return;
  }
  if (usernameInput.value.length >25) {
    window.alert("Please choose a username less or equal to 25 characters!");
    return;
  }
  if (usersList.includes(usernameInput.value)) {
    window.alert("Username already in use.");
    return;
  }
  socket.emit("join", usernameInput.value);
  oldusername=usernameInput.value;
  joinedBool=true;
  document.getElementById("overlay1").style.display = "none";
  document.getElementById("footer").style.display = "block";
  document.getElementById("Title").style.display = "none";
  joinChat.style.display = "none";
  usernameInput.style.display = "none";
  chatBox.style.display="block";
});

socket.on("update", update => {
    let date = new Date(Date.now())
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
    if (update.ip === uniqueIP) {
      chatMessages.innerHTML += `<p style="color:black; border: 100px;"><b>&#x3C;You&#x3E; ${update.sender}</b>: ${update.message}</p><p style="font-size: 2vh;">${date.toLocaleTimeString()} ${date.toDateString()}</p>`
    } else if (update.message.includes("@"+oldusername)) {
      chatMessages.innerHTML += `<p style="background-color: #FFFF99;"><b>${update.sender}</b>: ${update.message}</p><p style="font-size: 2vh;">${date.toLocaleTimeString()} ${date.toDateString()}</p>`;
      pings++;
      document.title = "PINGS "+ pings;
    } else {
      chatMessages.innerHTML += `<p><b>${update.sender}</b>: ${update.message}</p><p style="font-size: 2vh;">${date.toLocaleTimeString()} ${date.toDateString()}</p>`;
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on("userjoin", username => {
  document.getElementById("list").innerHTML  += `<p id="person">${username}</p><br><br>`;
  usersList.push(username);
  chatMessages.innerHTML += ` <p><b><span style="color: #f26419">>${username}</span></b> has joined the chat!</p>`;
});

socket.on("userleave", username => {
  document.getElementById("list").innerHTML = document.getElementById("list").innerHTML.replace(`<p id="person">${username}</p><br><br>`, '')
  chatMessages.innerHTML += `<p><span style="font-family: 'Anton', sans-serif;" >${username}</span> <span style="color: #ff1900; font-family: 'Anton', sans-serif;" > has left the chat.</span></p>`;
  removeA(usersList, username)
});
const currentDate = new Date();
const timestamp = currentDate.getTime();

messageSend.addEventListener("click", (e) => {
  if (joinedBool === false) {
    if (joinedBool === false) {
      window.alert("The server just had an update!");
      window.location.href="https://ChatWebsite.computer78601.repl.co";
      return;
    }
  }
  if (messageInput.value.replaceAll("\n", "") == "") {
    window.alert("Please enter some content!");
    messageInput.value = '';
    return;
  }
  let message = messageInput.value;
  messageInput.value = '';
  socket.emit("send", message, usernameInput.value, uniqueIP);
});