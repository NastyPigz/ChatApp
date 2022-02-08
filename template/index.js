let loginSubmit = document.getElementById("login-submit");
let chatBox = document.getElementById("chat-box");
let chatMessages = document.getElementById("chat-messages");
let messageInput = document.getElementById("message-input");
let messageSend = document.getElementById("message-send");
let clearBtn = document.getElementById("clear");
let username;
let usersList = [];
let shiftClick = false;
let enterClick = false;
let shiftEnter = false;
let pings = 0;
let already_joined = false;

const socket = io();

// let cookies = document.cookie;

// window.alert(cookies);

window.onload = () => {
  document.title="CHAT";
}
document.onmousemove = () => {
  document.title="CHAT";
}
document.onkeydown = () => {
  document.title="CHAT";
}

function launchDM(person) {
  let conf = window.confirm(`Are you sure you want to DM ${person}?`);
  if (!conf) {
    return;
  } else {
    window.location.href = `https://ChatWebsite.computer78601.repl.co/dm/${person}`
  }
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
  if (event.keyCode===16) {
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

socket.on("PRIVATE_REQUEST", (_usname, starter) => {
  if (_usname === username) {
    confirmation = window.confirm(`${starter} wants to DM you`);
    if (confirmation) {
      window.location.href = `https://chatwebsite.computer78601.repl.co/dm/${starter}`
    }
  }
})

socket.on("ALT", () => {
  window.location.href = "https://ChatWebsite.computer78601.repl.co/stupid";
})

socket.on("READY", (name, users) => {
 
  if (name == undefined) {
    window.alert("You are not signed in!");
    window.location.href = "https://ChatWebsite.computer78601.repl.co/login";
    return;
  }
  
  username = name.replace("cookieName=", "");
  usersList = users;
  console.log(usersList);
  usersList.forEach((usrname) => {
    usrname = usrname.replace("cookieName=", "");
    if (usrname == username) {
      window.location.href = "https://ChatWebsite.computer78601.repl.co/stupid";
      return;
    }
    usrname = usrname.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    document.getElementById("list").innerHTML  += `<p id="person">${usrname}</p><br><br>`;
  })
  loginSubmit.click();
});

clearBtn.addEventListener("click", (e) => {
  chatMessages.innerHTML = "";
})

loginSubmit.addEventListener("click", (e) => {
  if (!already_joined) {
    socket.emit("join", username);
  }
  document.getElementById("logoutBtn").style.display = "block";
  document.getElementById("logoutBtn").style.zIndex = "9";

  chatBox.style.display="block";
});

document.getElementById("logoutBtn").addEventListener("click", (e)=> {
  window.location.href = "https://ChatWebsite.computer78601.repl.co/logout";
})

socket.on("MESSAGE_CREATE", update => {
    let date = new Date(Date.now())
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
});

socket.on("GLOBAL_USER_ADD", username => {
  document.getElementById("list").innerHTML  += `<p id="person">${username}</p><br><br>`;
  username = username.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  chatMessages.innerHTML += ` <p><b><span style="color: #f26419; margin-top: 0.7vh;">>${username}</span></b> has joined the chat!</p>`;
});

socket.on("GLOBAL_USER_EXIT", usrname => {
  if (usrname === "" || usrname == null) {
    return;
  }
  usrname = usrname.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  document.getElementById("list").innerHTML = document.getElementById("list").innerHTML.replaceAll(`<p id="person">${usrname}</p><br><br>`, '')
  chatMessages.innerHTML += `<p><span style=" font-family: 'Anton', sans-serif; margin-top: 0.7vh;" >${usrname}</span> <span style="color: #ff1900; font-family: 'Anton', sans-serif;" > has left the chat.</span></p>`;
});

messageSend.addEventListener("click", (e) => {
  if (messageInput.value.replaceAll("\n", "") == "") {
    // window.alert("Please enter some content!");
    // messageInput.value = '';
    return;
  }
  if (messageInput.value.split("\n").length > 6) {
    window.alert("Max lines are 5!");
    messageInput.value = '';
    return;
  }
  let message = messageInput.value;
  messageInput.value = '';
  socket.emit("send", message, username);
});