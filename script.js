//Step 1: Ask names of players
const templates = {
  playername: document.getElementById("player-name"),
  playercards: document.getElementById("player-cards")
};
const players = document.getElementById("players");
const gameboard = document.getElementById("gameboard");
const deck = document.getElementById("deck");
const open_card = document.getElementById("open-card");
for (let i = 0; i < 8; i++) {
  const clone = templates.playername.content.cloneNode(true);
  players.appendChild(clone);
}
function begingame(event) {
  while (gameboard.hasChildNodes())
    gameboard.removeChild(gameboard.firstChild);
  const gAmE = new Game(
    Array.from(document.forms.players.playernames, i => i.value).filter(i => i != "")
  );
  gAmE.dealcards();
  function playerwantstoopencard(playerIndex, cardIndex) {
    console.log(`player ${playerIndex} wants to open card ${cardIndex}`);
    if (gAmE.player_cards_open(playerIndex) < 2) {
      cardflip(playerIndex, cardIndex);
    }
  }
  function make_player_board(playername, i) {
    const clone = templates.playercards.content.cloneNode(true);
    clone.getElementById("gbname").textContent = playername;
    const table = clone.querySelector("table");
    table.id = `board${i}`;
    const totalpoints = clone.getElementById("totalpoints");
    totalpoints.id = `totalpoints${i}`;
    if (i % 2 == 1) 
      table.classList.add("altbackground");
    const cardbuttons = table.querySelectorAll("button[name='cardbutton']");
    for (let j in cardbuttons) {
      cardbuttons[j].onclick = event => playerwantstoopencard(i, j);
    }
    gameboard.appendChild(clone);
  }
  gAmE.playernames.forEach(make_player_board);
  function showlastopencard() {
    lastopen = gAmE.last_open();
    open_card.textContent = lastopen;
    open_card.classList.value = `cardbutton ${cardbackgrounds[lastopen]}`;
  }
  showlastopencard();
  function cardflip(playerIndex, cardIndex) {
    if (gAmE.open_if_closed(playerIndex, cardIndex)) {
      const playerboard = document.getElementById(`board${playerIndex}`);
      const cardbutton = playerboard.querySelectorAll("button[name='cardbutton']")[cardIndex];
      cardbutton.textContent = gAmE.player_card(playerIndex, cardIndex);
      cardbutton.classList.add(cardbackgrounds[gAmE.player_card(playerIndex, cardIndex)]);

      const totalpoints = document.getElementById(`totalpoints${playerIndex}`);
      totalpoints.textContent = gAmE.player_points(playerIndex).toString();
    }
  }
  while (!gAmE.is_debut_complete())
    wait();
  //cardflip(0, 0); just for tests

  //document.getElementById("board0").classList.add("turn");
}
