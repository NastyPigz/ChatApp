let main = document.getElementById("stuff");
let tick = 1;

function generateRandom(length) {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./?><":;|}]{[=+-_)(*&^%$#@!~`';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   };
   return result;
}

function swapstyle() {
  if (tick === 1) {
    document.getElementById("stuff").style.color = "red";
    tick = 2;
  } else if (tick === 2) {
    document.getElementById("stuff").style.color = "green";
    tick = 3;
  } else if (tick === 3) {
    document.getElementById("stuff").style.color = "blue";
    tick = 1;
  }
}

function screw() {
  main.innerHTML = generateRandom(100);
  setTimeout(screw, 50);
  setTimeout(swapstyle, 50);
}

window.onload = () => {
  main.innerHTML = "hello we are hacking your browser now!";
  setTimeout(screw, 3000);
}