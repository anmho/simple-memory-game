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



// Global Constants (modifiers)
// Sequence modifiers
const clueHoldTime = 500; // Duration for each clue's light/sound (ms)
const cluePauseTime = 333;
const nextClueWaitTime = 1000;

/*
 * Initializes game state, clears previous messages, and generates the sequence
 *
 */
function startGame() {
  // Remove the end message from previous game
  document.querySelector("#winMessage").classList.remove("hidden");
  document.querySelector("#winMessage").classList.add("invisible");
  document.querySelector("#loseMessage").classList.add("hidden");
  document.querySelector("#loseMessage").classList.add("invisible");
  
  // Disable modifers from being changed during game
  document.querySelector("#btnSlider").disabled = true;
  document.querySelector("#roundSlider").disabled = true;
  
  // Initialize game state
  gamePlaying = true;
  round = 1;
  guessCounter = 0;
  // Generate 8 sequence
  for (let i = 0; i < maxRounds; i++) {
    let btnNum = Math.floor(Math.random() * numButtons + 1);
    sequence.push(btnNum);
  }

  console.log(sequence);
  playClueSequence();
}

function guess(buttonNum) {
  // Check if player clicked the right button
  if (buttonNum !== sequence[guessCounter]) {
    loseGame();
    return;
  }
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
  
  // Re-enable modifiers
  console.log("stopping");
  document.querySelector("#btnSlider").disabled = false;
  document.querySelector("#roundSlider").disabled = false;
  
}

function loseGame() {
  stopGame();
  document.querySelector("#winMessage").classList.add("hidden");
  document.querySelector("#winMessage").classList.add("invisible");
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
  startGame();

  // Toggle stop and startBtn
  const stopBtn = startBtn.parentNode.querySelector("#stopBtn");
  startBtn.classList.add("hidden");
  stopBtn.classList.remove("hidden");
  console.log("start");
}

function whenStopButtonClicked(stopBtn) {
  stopGame();

  // Toggle stop and startBtn
  const startBtn = stopBtn.parentNode.querySelector("#startBtn");
  startBtn.classList.remove("hidden");
  stopBtn.classList.add("hidden");
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
}


// Changes the number of buttons to click in the game
function whenButtonSliderChanged(slider) {
  numButtons = parseInt(slider.value);
  document.querySelector("#numBtns").innerHTML = "Number of Buttons: " + numButtons;
  const buttons = document.querySelector("#gameButtonArea").children;
  
  // Unhide buttons
  for (let i = 0; i < buttons.length; i++) {
    if (i < numButtons) {
      console.log(buttons[i])
      buttons[i].classList.remove("hidden")
    } else {
      buttons[i].classList.add("hidden");
    }
  }
}

// Changes the number of rounds to play per game
function whenRoundSliderChanged(slider) {
  maxRounds = parseInt(slider.value);
  console.log(maxRounds);
  document.querySelector("#numRounds").innerHTML = "Number of Rounds: " + maxRounds;
}




function init() {
  // Bind Controls
  const controls = document.querySelector("#controls");
  // Start the game
  controls
    .querySelector("#startBtn")
    .addEventListener("click", (e) => whenStartButtonClicked(e.target));
  // Stop the game
  controls
    .querySelector("#stopBtn")
    .addEventListener("click", (e) => whenStopButtonClicked(e.target));
  // Change number of buttons
  controls
    .querySelector("#btnSlider")
    .addEventListener("input", (e) => whenButtonSliderChanged(e.target))
  // Change Number of Rounds
  controls
    .querySelector("#roundSlider")
    .addEventListener("input", (e) => whenRoundSliderChanged(e.target))

  // Bind Game Buttons
  const buttons = Array.from(document.querySelector("#gameButtonArea").children);
  buttons.forEach((button, index) => {
      button.addEventListener("click", (e) => whenGameButtonClicked(e.target));
      button.addEventListener("mousedown", (e) => startTone(index+1));
      button.addEventListener("mouseup", (e) => stopTone());
    }
  );
  buttons.forEach((button) => button.classList.add("dipped"));  
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
}
function playTone(btn,len){ 
  o.frequency.value = freqMap[btn]
  g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
  context.resume()
  tonePlaying = true
  setTimeout(function(){
    stopTone()
  },len)
}
function startTone(btn){
  if(!tonePlaying){
    context.resume()
    o.frequency.value = freqMap[btn]
    g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
    context.resume()
    tonePlaying = true
  }
}
function stopTone(){
  g.gain.setTargetAtTime(0,context.currentTime + 0.05,0.025)
  tonePlaying = false
}

// Page Initialization
// Init Sound Synthesizer
var AudioContext = window.AudioContext || window.webkitAudioContext 
var context = new AudioContext()
var o = context.createOscillator()
var g = context.createGain()
g.connect(context.destination)
g.gain.setValueAtTime(0,context.currentTime)
o.connect(g)
o.start(0)






