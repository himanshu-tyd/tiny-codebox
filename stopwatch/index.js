const rootEl = document.getElementById("root");
const secondsEl = document.getElementById("seconds");
const milisecondsEl = document.getElementById("miliseconds");
const startBtn = document.getElementById("start-btn");
const stopEl = document.getElementById("stop");
let interval;
let seconds = 0;
let miliseconds = 0;

document.addEventListener("DOMContentLoaded", () => {
  startBtn.onclick = () => {
    interval = setInterval(() => {
      console.log("called");

      if (miliseconds > 99) {
        seconds++;
        miliseconds = 0;
        secondsEl.innerHTML = formater(seconds);
      }
      miliseconds++;
      milisecondsEl.innerHTML = formater(miliseconds);
    }, 10);
  };

  stopEl.onclick = () => {
    clearInterval(interval);
  };

  function formater(value) {
    return value.toString().padStart(2, "0");
  }
});
