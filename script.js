// Game state
let gamePlaying = false;
let sequence = [];
let maxRounds = 8;
let round = 0;
let guessCounter = 0;
let playerSequence = [];
let numButtons = 4;

let tonePlaying = false;
let volume = 0.5;
let triesUsed = 0;
const maxTries = 3;

const maxSecondsLeft = 10;
let secondsLeft = maxSecondsLeft;

let countdownID;

// Global Constants (modifiers)
// Sequence modifiers
const maxClueHoldTime = 500;
let clueHoldTime = 500; // Duration for each clue's light/sound (ms)
const cluePauseTime = 333;
const nextClueWaitTime = 1000;

/*
 * Initializes game state, clears previous messages, and generates the sequence
 *
 */
function startGame() {
  // Initialize game state
  gamePlaying = true;
  round = 1;
  guessCounter = 0;
  // Generate 8 sequence
  for (let i = 0; i < maxRounds; i++) {
    let btnNum = Math.floor(Math.random() * numButtons + 1);
    sequence.push(btnNum);
  }

  // Show tries counter
  const triesArea = document.querySelector(".tries-area");
  triesArea.classList.remove("hidden");

  // Remove the end message from previous game
  const winMessage = document.querySelector("#winMessage");
  const loseMessage = document.querySelector("#loseMessage");

  winMessage.classList.remove("hidden");
  winMessage.classList.add("invisible");
  loseMessage.classList.add("hidden");
  loseMessage.classList.add("invisible");

  // Disable modifers from being changed during game
  document.querySelector("#btnSlider").disabled = true;
  document.querySelector("#roundSlider").disabled = true;

  // Remove all tries shown
  const triesCounter = triesArea.querySelector("#tries-counter");
  for (let attempt of triesCounter.children) {
    console.log(attempt.children[0]);
    attempt.children[0].classList.add("invisible");
  }

  console.log(sequence);
  playClueSequence();
}

function guess(buttonNum) {
  // Check if player clicked the right button
  if (buttonNum !== sequence[guessCounter]) {
    triesUsed++;
    if (triesUsed < maxTries) {
      const tryMark = document.querySelector("#try-" + triesUsed);
      tryMark.classList.remove("invisible");
      guessCounter = 0;
      stopCountdown();
      playClueSequence();
    } else {
      loseGame();
    }

    return;
  }

  // Guessed right
  guessCounter++;
  // Win condition
  // Clicked all the buttons and final round
  // => Win
  if (guessCounter === round && round === maxRounds) {
    winGame();
    return;
  }

  // Clicked all buttons and not last round
  // => Move to next round
  if (guessCounter === round && round < maxRounds) {
    round++;
    guessCounter = 0;
    triesUsed = 0;
    clueHoldTime -= maxClueHoldTime / maxRounds;
    stopCountdown();
    playClueSequence();
    return;
  }
}

// Sets all gamestate values to default
function stopGame() {
  gamePlaying = false;
  round = 0;
  guessCounter = 0;
  sequence = [];
  playerSequence = [];
  triesUsed = 0;
  clueHoldTime = maxClueHoldTime;
  stopCountdown();
  secondsLeft = maxSecondsLeft;

  // Hide tries counter
  const triesArea = document.querySelector(".tries-area");
  triesArea.classList.add("hidden");

  // Re-enable modifiers
  document.querySelector("#btnSlider").disabled = false;
  document.querySelector("#roundSlider").disabled = false;

  // Toggle stop button back to start button
  const stopBtn = document.querySelector("#stopBtn");
  const startBtn = document.querySelector("#startBtn");
  startBtn.classList.remove("hidden");
  stopBtn.classList.add("hidden");

  console.log("stopping");
}

function loseGame() {
  stopGame();
  // Hide win message
  document.querySelector("#winMessage").classList.add("hidden");
  document.querySelector("#winMessage").classList.add("invisible");
  // Show lose message
  document.querySelector("#loseMessage").classList.remove("invisible");
  document.querySelector("#loseMessage").classList.remove("hidden");
}

function winGame() {
  stopGame();
  document.querySelector("#winMessage").classList.remove("hidden");
  document.querySelector("#winMessage").classList.remove("invisible");
  document.querySelector("#loseMessage").classList.add("invisible");
  document.querySelector("#loseMessage").classList.add("hidden");
}

function whenGameButtonClicked(button) {
  if (!gamePlaying) return;

  const buttonNum = Array.from(button.parentNode.children).indexOf(button) + 1;
  console.log("User guessed: " + buttonNum, sequence[guessCounter]);

  guess(buttonNum);
}

function whenStartButtonClicked(startBtn) {
  // Toggle stop and startBtn
  const stopBtn = startBtn.parentNode.querySelector("#stopBtn");
  startBtn.classList.add("hidden");
  stopBtn.classList.remove("hidden");

  // Start game
  startGame();
  console.log("start");
}

function whenStopButtonClicked(stopBtn) {
  // Toggle stop and startBtn
  const startBtn = stopBtn.parentNode.querySelector("#startBtn");
  startBtn.classList.remove("hidden");
  stopBtn.classList.add("hidden");

  // Start game
  stopGame();
  console.log("stop");
}

function lightButton(btn) {
  document.getElementById("button" + btn).classList.add("lit");
}

function clearButton(btn) {
  document.getElementById("button" + btn).classList.remove("lit");
}

function playSingleClue(btn) {
  if (gamePlaying) {
    lightButton(btn);
    playTone(btn, clueHoldTime);
    setTimeout(clearButton, clueHoldTime, btn);
  }
}

function playClueSequence() {
  context.resume();
  let delay = nextClueWaitTime;
  for (let i = 0; i < round; i++) {
    console.log("play single clue: " + sequence[i] + " in " + delay + "ms");
    setTimeout(playSingleClue, delay, sequence[i]);
    delay += clueHoldTime;
    delay += cluePauseTime;
  }

  startCountdown();
}

// Changes the number of buttons to click in the game
function whenButtonSliderChanged(slider) {
  numButtons = parseInt(slider.value);
  document.querySelector("#numBtns").innerHTML =
    "Number of Buttons: " + numButtons;
  const buttons = document.querySelector("#gameButtonArea").children;

  // Unhide buttons
  for (let i = 0; i < buttons.length; i++) {
    if (i < numButtons) {
      console.log(buttons[i]);
      buttons[i].classList.remove("hidden");
    } else {
      buttons[i].classList.add("hidden");
    }
  }
}

// Changes the number of rounds to play per game
function whenRoundSliderChanged(slider) {
  maxRounds = parseInt(slider.value);
  console.log(maxRounds);
  document.querySelector("#numRounds").innerHTML =
    "Number of Rounds: " + maxRounds;
}

function toggleDarkMode() {
  document.body.classList.add("dark-mode");
  document.querySelector(".title").classList.add("dark-mode");
}

function toggleLightMode() {
  document.body.classList.remove("dark-mode");
  document.querySelector(".title").classList.remove("dark-mode");
}

function init() {
  // Bind Controls
  const startBtn = document.querySelector("#startBtn");
  startBtn.addEventListener("click", (e) => whenStartButtonClicked(e.target));
  // startBtn.classList.add("dipped");
  
  const stopBtn = document.querySelector("#stopBtn")
  stopBtn.addEventListener("click", (e) => whenStopButtonClicked(e.target));
  // stopBtn.classList.add("dipped");
  
  const btnSlider = document.querySelector("#btnSlider");
  btnSlider.addEventListener("input", (e) => whenButtonSliderChanged(e.target));
  
  const roundSlider = document.querySelector("#roundSlider");
  roundSlider.addEventListener("input", (e) => whenRoundSliderChanged(e.target));
  
  
  const darkModeBtn = document.querySelector("#dark-mode");
  // darkModeBtn.classList.add("dipped");
  darkModeBtn.addEventListener("click", (e) => toggleDarkMode(e.target));
  
  const lightModeBtn = document.querySelector("#light-mode");
  // lightModeBtn.classList.add("dipped");
  lightModeBtn.addEventListener("click", (e) => toggleLightMode(e.target));
  
  

  // Bind Game Buttons
  const buttons = Array.from(
    document.querySelector("#gameButtonArea").children
  );
  buttons.forEach((button, index) => {
    button.addEventListener("click", (e) => whenGameButtonClicked(e.target));
    button.addEventListener("mousedown", (e) => startTone(index + 1));
    button.addEventListener("mouseup", (e) => stopTone());
  });
  buttons.forEach((button) => button.classList.add("dipped"));
}

function startCountdown() {
  secondsLeft = maxSecondsLeft;
  countdownID = setInterval(updateCountdown, 1000);
}

function stopCountdown() {
  clearInterval(countdownID);
  secondsLeft = maxSecondsLeft;
  const timer = document.querySelector("#countdown-timer");
  timer.innerText = `Time Left: ${secondsLeft}`;
}

function updateCountdown() {
  secondsLeft--;
  console.log(secondsLeft);

  const timer = document.querySelector("#countdown-timer");
  timer.innerText = `Time Left: ${secondsLeft}`;
  if (secondsLeft === 0) {
    loseGame();
  }
}

init();

// Sound Synthesis Functions
const freqMap = {
  1: 261.6,
  2: 329.6,
  3: 392,
  4: 466.2,

  5: 261.6,
  6: 329.6,
  7: 392,
  8: 466.2,

  9: 261.6,
  10: 329.6,
  11: 392,
  12: 466.2,
};
function playTone(btn, len) {
  o.frequency.value = freqMap[btn];
  g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
  context.resume();
  tonePlaying = true;
  setTimeout(function () {
    stopTone();
  }, len);
}
function startTone(btn) {
  if (!tonePlaying) {
    context.resume();
    o.frequency.value = freqMap[btn];
    g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
    context.resume();
    tonePlaying = true;
  }
}
function stopTone() {
  g.gain.setTargetAtTime(0, context.currentTime + 0.05, 0.025);
  tonePlaying = false;
}

// Page Initialization
// Init Sound Synthesizer
var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var o = context.createOscillator();
var g = context.createGain();
g.connect(context.destination);
g.gain.setValueAtTime(0, context.currentTime);
o.connect(g);
o.start(0);
