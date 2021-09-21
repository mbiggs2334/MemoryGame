const gameContainer = document.getElementById("game");
let timeOut = undefined;
const scoreWrapper = document.getElementById("high-score-wrapper");
const scoreContainer = document.querySelector("#score");
const printBtn = document.querySelector("#printBtn");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const modalWrapper = document.querySelector(".modal-wrapper");
const modalExit = document.getElementById("close-modal");
const firstSelect = { color: undefined };
const secondSelect = { color: undefined };
const storageTimes = JSON.parse(localStorage.getItem("bestTimes")) || [];
let currentTime = 0;
let score = 0;
let secs;
let mins;
let clearTime;
let clearState;
let seconds = 0;
let minutes = 0;
let hours = 0;
let timerElement = document.getElementById("timer");
const COLORS = [
  "red",
  "blue",
  "green",
  "orange",
  "purple",
  "red",
  "blue",
  "green",
  "orange",
  "purple",
];



startBtn.addEventListener("click", start);
resetBtn.addEventListener("click", reset);
modalExit.addEventListener("click", function (e) {
  document.getElementById('high-scores').remove();
  modalWrapper.style.display = 'none';
  reset();
});

function stopListening() {
  const gameContainerDivs = gameContainer.getElementsByTagName("div");
  for (let i = 0; i < gameContainerDivs.length; i++) {
    gameContainerDivs[i].removeEventListener("click", handleCardClick);
  }
}

//Start button
function start() {
  const gameContainerDivs = gameContainer.getElementsByTagName("div");
  firstSelect.color = undefined;
  secondSelect.color = undefined;
  if (gameContainerDivs.length === 0) {
    shuffle(COLORS);
    createDivsForColors(shuffledColors);
  } else {
    const newArray = shuffle(COLORS);
    for (let i = 0; i < COLORS.length; i++) {
      gameContainerDivs[i].className = newArray[i];
      gameContainerDivs[i].setAttribute("name", "");
      gameContainerDivs[i].addEventListener("click", handleCardClick);
    }
  }
  gameContainer.style.display = "flex";
  startBtn.removeEventListener("click", start);
  startWatch();
}

//Reset button
function reset() {
  score = 0;
  scoreContainer.innerHTML = `Score: ${score}`;
  const gameContainerDivs = gameContainer.getElementsByTagName("div");
  for (let i = 0; i < gameContainerDivs.length; i++) {
    if (gameContainerDivs[i].dataset.box === "yes") {
      gameContainerDivs[i].setAttribute("class", "");
      gameContainerDivs[i].setAttribute("name", "");
    }
  }
  clearTimeout(clearTime);
  currentTime = 0;
  seconds = 0;
  minutes = 0;
  timerElement.innerHTML = "Time:  00: 00";
  startBtn.addEventListener("click", start);
  stopListening();
}

// here is a helper function to shuffle an array
// it returns the same array with values shuffled
// it is based on an algorithm called Fisher Yates if you want ot research more
function shuffle(array) {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}

let shuffledColors = shuffle(COLORS);

// this function loops over the array of colors
// it creates a new div and gives it a class with the value of the color
// it also adds an event listener for a click for each card
function createDivsForColors(colorArray) {
  for (let color of colorArray) {
    // create a new div
    const newDiv = document.createElement("div");

    // give it a class attribute for the value we are looping over
    newDiv.classList.add(color);
    newDiv.setAttribute("name", "");
    newDiv.setAttribute("data-box", "yes");

    // call a function handleCardClick when a div is clicked on
    newDiv.addEventListener("click", handleCardClick);

    // append the div to the element with an id of game
    gameContainer.append(newDiv);
  }
}

// TODO: Implement this function!
function handleCardClick(e) {
  //Assigning second selection
  if (firstSelect.color !== undefined) {
    secondSelect.color = e.target.className;
    e.target.className = e.target.className + "-select";
    e.target.setAttribute("name", "selected");
  }
  //Assigning first selection
  if (firstSelect.color === undefined) {
    firstSelect.color = e.target.className;
    e.target.className = e.target.className + "-select";
    e.target.setAttribute("name", "selected");
    e.target.removeEventListener("click", handleCardClick); //Prevents double click
  }
  //Guessed Correctly
  if (firstSelect.color === secondSelect.color) {
    score++;
    scoreContainer.innerHTML = `Score: ${score}`;
    firstSelect.color = undefined;
    secondSelect.color = undefined;
    e.target.setAttribute("name", "matched");
    e.target.removeEventListener("click", handleCardClick);
    document
      .querySelector('div[name="selected"')
      .removeEventListener("click", handleCardClick);
    document
      .querySelector('div[name="selected"')
      .setAttribute("name", "matched");
    if (score === 5) {
      stopListening();
      clearTimeout(clearTime);
      addToStorage();
      highScores();
    }
  }
  //Guessed incorrectly
  else if (
    firstSelect.color !== secondSelect.color &&
    secondSelect.color !== undefined
  ) {
    //Prevents more than two being clicked.1
    let prevent = document.querySelectorAll('div[name=""]');
    for (let div of prevent) {
      div.removeEventListener("click", handleCardClick);
    }
    e.target.removeEventListener("click", handleCardClick);
    e.target.setAttribute("name", "");
    firstSelect.color = undefined;
    secondSelect.color = undefined;
    timeOut = setTimeout(function () {
      document.querySelector('div[name="selected"]').className = document
        .querySelector('div[name="selected"')
        .className.toString()
        .replace("-select", "");
      document
        .querySelector('div[name="selected"')
        .addEventListener("click", handleCardClick);
      e.target.addEventListener("click", handleCardClick);
      document.querySelector('div[name="selected"]').setAttribute("name", "");
      e.target.className = e.target.className.toString().replace("-select", "");
      //Prevents more than two being clicked.2
      for (let div of prevent) {
        div.addEventListener("click", handleCardClick);
      }
    }, 1000);
  }
}

// Presents high scores
function highScores() {
  document.getElementById('current-score').innerText = currentScore(minutes, secs);
  const list = document.createElement('ol');
  list.id = 'high-scores';
  scoreWrapper.appendChild(list);
  const empty = [];
  for (let i = 0; i < storageTimes.length; i++) {
    empty.push(storageTimes[i].bestTimes);
  }
  empty.sort(function(a,b){return a-b});
  for (let i = 0; i < empty.length; i++) {
    let listScore = document.createElement("li");
    listScore.innerText = readableScores(empty, i);
    list.appendChild(listScore);
  }
  modalWrapper.style.display = "flex";
  modalWrapper.style.width = "100vw";
  modalWrapper.style.height = "100%";
}

// Timer
function startWatch() {
  if (seconds === 60) {
    seconds = 0;
    minutes = minutes + 1;
  }
  mins = minutes < 10 ? "0" + minutes + ": " : minutes + ": ";
  secs = seconds < 10 ? "0" + seconds : seconds;
  seconds++;
  currentTime = minutes + ' ' + secs;
  timerElement.innerHTML = "Time:    " + mins + secs;
  clearTime = setTimeout(startWatch, 1000);
}

function addToStorage() {
  let timeInSec = (parseInt(minutes) * 60) + parseInt(secs);
  if (storageTimes.length >= 5) {
    for (let i = 0; i < storageTimes.length; i++) {
      if (timeInSec <= storageTimes[i].bestTimes) {
        storageTimes.splice(i, 1);
        storageTimes.push({ bestTimes: timeInSec });
        break;
      }
    }
  } else {
    storageTimes.push({ bestTimes: timeInSec });
    localStorage.setItem("bestTimes", JSON.stringify(storageTimes));
  }
}

//Better current time
function currentScore(minutes, secs){
  if(minutes === 0){
    return `${secs}s`;
  } else {
    return `${minutes}m & ${secs}s`
  }
}

//Better looking high scores
function readableScores(arr, i){
  if(Math.floor(arr[i] % 3600 / 60) === 0){
    return `${Math.floor(arr[i] % 3600 % 60)} seconds`;
  } else {
    return `${Math.floor(arr[i] % 3600 / 60)} minutes & ${Math.floor(arr[i] % 3600 % 60)} seconds`
  }
} 