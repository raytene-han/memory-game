"use strict";

/** Memory game: find matching pairs of cards and flip both of them. */

const FOUND_MATCH_WAIT_MSECS = 1000;
let DIFFICULTY = 1;
let COLORS = [];

function generateRGB() {
  // This function generates a random color using RGB by creating an empty array
  // that will consist of 3 values. It iterates 3 times and uses the build-in
  // random number generator. The function returns a string with the RGB values.
  let vals = [];
  for (let i = 0; i < 3; i++) {
    vals[i] = Math.floor(Math.random() * 255);
  }

  return `rgb(${vals[0]},${vals[1]},${vals[2]})`;
}

function generateColors() {
  // This function generates the COLORS array by iterating over the set
  // DIFFICULTY multiplied by 6. With each iteration, it calls the generateRGB
  // function. The resulting COLORS array is then concatenated with a copy of
  // itself in order to create the matching pairs.
  for (let i = 0; i < DIFFICULTY * 5; i++) {
    COLORS.push(generateRGB());
  }

  COLORS = COLORS.concat(COLORS);
}

let colors;// = shuffle(COLORS);

// Define a few values that will come in handy for keeping track of how many cards
// are currently flipped up and the two current cards being checked. These variables
// will be used in several functions (flipCard, handleCardClick, checkCardsMatch,
// countFlips, handleButton).
let cardsFlipped = 0;

let card1;
let card2;

// A boolean used to prevent users from clicking on too many cards at once.
let canClick = true;

/** Shuffle array items in-place and return shuffled array. */

function shuffle(items) {
  // This algorithm does a "perfect shuffle", where there won't be any
  // statistical bias in the shuffle (many naive attempts to shuffle end up not
  // be a fair shuffle). This is called the Fisher-Yates shuffle algorithm; if
  // you're interested, you can learn about it, but it's not important.

  for (let i = items.length - 1; i > 0; i--) {
    // generate a random index between 0 and i
    let j = Math.floor(Math.random() * i);
    // swap item at i <-> item at j
    // simultaneously swaps i and j.. don't need a temp value!
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items;
}

/** Create card for every color in colors (each will appear twice)
 *
 * Each div DOM element will have:
 * - a class with the value of the color
 * - a click event listener for each card to handleCardClick
 */

function createCards(colors) {
  const gameBoard = document.getElementById("game");
  let html = "";

  // for (let color of colors) {
  // Prefer to use a counter loop to create a card id that is unique.
  // The div with class "card" is the container for the front and back of the card
  // We have a div with class "card-front" and a separate id used for handling the
  // Click event (see handleCardClick function).
  for (let i = 0; i < colors.length; i++) {
    html += `
          <div class="card ${colors[i]}" id="card-${i}">
            <div class="card-front" id="card-front-${i}">
            </div>
            <div class="card-back" style="background:${colors[i]}">
            </div>
          </div>`;

  }

  gameBoard.innerHTML = html;
}


/** Flip a card face-up. */

function flipCard(card) {
  // This function flips the selected card face-up by toggling the class "flipped".
  // It also increments the cardsFlipped variable and calls the function checkStep.
  console.log("flipCard", card)

  let id = document.getElementById(card);
  console.log(id);
  id.classList.toggle("flipped");

  cardsFlipped += 1;

  checkNextStep(id);
}

function checkNextStep(id) {
  /* This function checks what the value of cardsFlipped is and decides what action
  to take. The value of cardsFlipped can only ever be 0, 1, or 2. If it is 0, the function
  flipCard is not invoked. If it is 1, then the click listener for the current card is
  removed it prevent the user from clicking on the same card twice. The current card id
  is stored in the variable card1. If the variable is 2, then card2 is set equal
  to the current card id and checkCardsMatch is called with card1 and card2 as arguments. */
  if (cardsFlipped === 1) {
    card1 = id;
    id.removeEventListener("click", handleCardClick);
  } else if (cardsFlipped === 2) {
    card2 = id;
    checkCardsMatch(card1, card2);
  }
}

/** Flip a card face-down. */

function unFlipCard(card) {
  console.log("unFlipCard")

  card.classList.toggle("flipped");
}

/** Handle clicking on a card: this could be first-card or second-card. */

function handleCardClick(evt) {
  /* This function handles clicking on a card. It checks if the boolean
  canClick is true, which then calls the flipCard function. */
  console.log("handleCardClick", evt);

  let id = evt.target.id;
  console.log(id);
  let cardId = id.replace("card-front", "card");
  if (canClick) {
    flipCard(cardId);
  }
}

function addClickListeners() {
  /* This function adds event listeners to each of the cards in the array by id.
  It calls the function handleCardClick upon each click.  */
  console.log("addClickListeners");

  for (let i = 0; i < colors.length; i++) {
    let card = document.getElementById(`card-${i}`);
    card.addEventListener("click", handleCardClick);
  }
}

function checkCardsMatch(firstCard, secondCard) {
  /* This function checks if the two flipped cards are a match. If they do not match,
  the event listener is added back to the first card because it was removed during
  the flipCard function. There is a timeout set for one second before the cards are
  flipped back. If the cards match, then the event listeners are removed from both
  cards and the checkWin function is called. If checkWin is true, then the current
  score is updated, the functions showScore and updateBestScore are called, and
  handleWin is called after a short timeout.

  If checkWin is false, then canClick is set to false to prevent users from spamming
  card clicks, cardsFlipped is reset to 0, currentScore is incremented, and timeouts
  are set for showScore to update the current score, and enableClick to allow the user
  to click on cards again.
  */
  let firstColor = firstCard.className;
  let secondColor = secondCard.className;

  console.log("checkCardsMatch", firstColor, secondColor, firstColor === secondColor);

  if (firstColor !== secondColor) {
    firstCard.addEventListener("click", handleCardClick);
    setTimeout(function() { unFlipCard(firstCard); }, FOUND_MATCH_WAIT_MSECS);
    setTimeout(function() { unFlipCard(secondCard); }, FOUND_MATCH_WAIT_MSECS);
  } else {
    firstCard.removeEventListener("click", handleCardClick);
    secondCard.removeEventListener("click", handleCardClick);
    if (checkWin()) {
      currentScore++;
      showScore();
      updateBestScore();
      setTimeout(handleWin, FOUND_MATCH_WAIT_MSECS / 2);
      return;
    }
  }
  canClick = false;
  cardsFlipped = 0;
  currentScore++;
  setTimeout(showScore, FOUND_MATCH_WAIT_MSECS);
  setTimeout(enableClick, FOUND_MATCH_WAIT_MSECS);
}

function checkWin() {
  /* This function checks whether the user has successfully matched all cards
  It iterates through the colors array and checks if any of the cards do not
  contain the flipCard class.
  */
  for (let i = 0; i < colors.length; i++) {
    let card = document.getElementById(`card-${i}`);
    if (!card.classList.contains("flipped")) {
      return false;
    }
  }

  return true;
}

function handleWin() {
  /* This function handles when the user has won the game. It alerts the user
  with a message and upon confirming, the reset button will appear.*/
  console.log("handleWin");
  alert('Yay, you won!');
  let button = document.getElementById("restartbutton");
  button.removeAttribute("hidden")
}

function enableClick() {
  /* This function changes the canClick variable to true */
  canClick = true;
}

function handleButton(evt) {
  /* This function handles the start and restart buttons for the game. When either
  button is clicked, a new game is generated by setting the COLORS array to an empty
  array, calling generateColors, adding the shuffled colors to the colors array,
  addClickListeners, and resetting cardsFlipped to 0.

  It also hides the button after the game starts, sets the currentScore to 0, and
  calls showScore.
  */
  console.log("handleButton", evt);

  COLORS = [];
  generateColors();
  colors = shuffle(COLORS);
  createCards(colors);
  addClickListeners();
  cardsFlipped = 0;

  let button;
  if (evt.target.id.startsWith("start")){
    button = document.getElementById("startbutton");
  } else {
    button = document.getElementById("restartbutton");
  }
  button.setAttribute("hidden", "hidden");
  currentScore = 0;
  showScore();
}

let currentScore = 0;
let bestScore = Infinity;

function showScore() {
  /* This function removes the hidden attribute for the current score after a
  game has started */
  let scoreboard = document.getElementById("score");
  let html = `Current Score: ${currentScore}`;
  scoreboard.removeAttribute("hidden");
  scoreboard.innerHTML = html;
}

function updateBestScore() {
  /* This function updates the best score if the currentScore is lower than
  bestScore. It also removes the hidden attribute and only appears after the first
  game has been played. */
  if (currentScore < bestScore) {
    bestScore = currentScore;
  }
  let scoreboard = document.getElementById("bestscore");
  let html = `Best Score: ${bestScore}`;
  scoreboard.removeAttribute("hidden");
  scoreboard.innerHTML = html;
}

// Add event listeners to the start and restart buttons
document.getElementById("startbutton").addEventListener("click", handleButton);
document.getElementById("restartbutton").addEventListener("click", handleButton);