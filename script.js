// tooling
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}
//Step 1: Ask names of players
const templates = {
  playername: document.getElementById("player-name"),
  playercards: document.getElementById("player-cards")
};
const players = document.getElementById("players");
const gameboard = document.getElementById("gameboard");
for (let i = 0; i < 8; i++) {
  const clone = templates.playername.content.cloneNode(true);
  players.appendChild(clone);
}
//Step 2: Activate game via button
function begingame(event) {
  while (gameboard.hasChildNodes())
    gameboard.removeChild(gameboard.firstChild);
  //Step 3: Shuffle the cards
  const cards = [-2, -2, -2, -2, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12];
  shuffle(cards);
  //Step 4: Count players
  const players = [];
  document.forms.players.playernames.forEach(input => {
    if (input.value != '')
      players.push(input.value);
  });
  //Step 5: deal 12 'cards' to each player and 'arrange' into a rectangle of 4x3 while removing the numbers/cards that we place from the "cards" array
  shuffle(players);
  const playerscards = [];
  for (let i = 0; i < 12; i++) {
    for (let j in players) {
      if (i == 0)
        playerscards[j] = [];
      playerscards[j].push({
        card: cards.pop(), 
        open: false
      });
    }
  }
  //console.log(playerscards);
  for (let i in players) {
    const clone = templates.playercards.content.cloneNode(true);
    clone.getElementById("gbname").textContent = players[i];
    const table = clone.querySelector("table");
    table.id = `board${i}`;
    if (i % 2 == 1) {
      table.classList.add("altbackground");
    }
    gameboard.appendChild(clone);
  }
  //Step 6: Let each player flip 2 cards over from their 12
  function cardflip(playerIndex, cardIndex) {
    if (!playerscards[playerIndex][cardIndex].open) {
      playerscards[playerIndex][cardIndex].open = true;
      const playerboard = document.getElementById(`board${playerIndex}`);
      const cardbutton = playerboard.querySelectorAll("button[name='cardbutton']")[cardIndex];
      cardbutton.textContent = playerscards[playerIndex][cardIndex].card.toString();
    }
  }
  //cardflip(0, 0); //just for tests
  document.getElementById("board0").classList.add("turn");
}