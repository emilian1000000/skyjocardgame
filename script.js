const templates = {
  playername: document.getElementById("player-name"),
  playercards: document.getElementById("player-cards")
};
const players = document.getElementById("players");
const gameboard = document.getElementById("gameboard");
const new_game = document.getElementById("new-game");
const deck = document.getElementById("deck");
const open_card = document.getElementById("open-card");
for (let i = 0; i < MAX_PLAYERS; i++) {
  const clone = templates.playername.content.cloneNode(true);
  players.appendChild(clone);
}

var gAmE = null;
var phases = [
  /*
     Players are expected to open two cards each
  */
  {
    finish: function() {
      if (!gAmE.is_debut_complete())
        return false;

      update_player(gAmE.current_player(), true);
      return true;
    },
    click_new_game: function() {
      gAmE = new Game(
        Array.from(document.forms.players.playernames, input => input.value).filter(name => name != "")
      );
      gAmE.deal_cards();
      show_card_on_button(open_card, gAmE.last_open());
      reset_board(gAmE.playernames);
    },
    click_player_card: function(player_index, card_index) {
      if (gAmE.player_cards_open(player_index) < 2 && gAmE.open_if_closed(player_index, card_index)) {
        update_player(
          player_index,
          false, // in this phase any player can move in any order
          gAmE.player_points(player_index),
          card_index,
          gAmE.player_card(player_index, card_index)
        );
      }
    },
    click_deck_card: function() {
      // game hasn't started
    },
    click_open_card: function() {
      // game hasn't started
    }
  },
  /*
     Players take turns until one opens their cards
  */
  {
    finish: function() {
      return false;
    },
    click_new_game: function() {
      // game in progress
    },
    click_player_card: function(player_index, card_index) {
      // pass
    },
    click_deck_card: function() {

    },
    click_open_card: function() {

    }
  },
  /*
     Remaining players take last turn
  */
  {
    finish: function() {
      return false;
    },
    click_new_game: function() {
      // game in progress
    },
    click_player_card: function(player_index, card_index) {

    },
    click_deck_card: function() {

    },
    click_open_card: function() {

    }
  },
  /*
     Players observe cards/scores and may play again
  */
  {
    finish: function() {
      return !gAmE;
    },
    click_new_game: function() {
      // TODO update player standing
      gAmE = null;
    },
    click_player_card: function(player_index, card_index) {
      // game is over
    },
    click_deck_card: function() {
      // game is over
    },
    click_open_card: function() {
      // game is over
    }
  }
];
phase_index = 0;

function phase() {
  return phases[phase_index];
}

function maybe_next_phase() {
  if (phases[phase_index].finish()) {
    // don't ever allow phases[phase_index] to be invalid
    next = phase_index + 1;
    console.log(`phase ${phase_index} -> ${next}`);
    if (phases.length <= next) {
      phase_index = 0;
      // auto-start next game to avoid requiring that button to be played twice
      phases[phase_index].click_new_game();
    }
  }
}

function on_click_new_game(event) {
  phase().click_new_game();
  maybe_next_phase();
}

function on_click_player_card(event, player_index, card_index) {
  phase().click_player_card(player_index, card_index);
  maybe_next_phase();
}

function on_click_deck_card(event) {
  phase().click_deck_card();
  maybe_next_phase();
}

function on_click_open_card(event) {
  phase().click_open_card();
  maybe_next_phase();
}

// bind shared buttons
deck.onclick = on_click_deck_card;
open_card.onclick = on_click_open_card;
new_game.onclick = on_click_new_game;

/*
   Helpful functions
*/

function update_player(player_index, current, points, card_index, card_value) {
  console.log(`update_player: ${current ? "!" : "#"}${player_index} has ${points} [${card_index}]=${card_value}`);

  if (points != undefined) {
    document.getElementById(`totalpoints${player_index}`).textContent = points.toString();
  }

  const playerboard = document.getElementById(`board${player_index}`);
  playerboard.classList.value = `${player_index % 2 == 1 ? "altbackground" : ""} ${current ? "turn" : ""}`;

  if (card_index != undefined) {
    const cardbutton = playerboard.querySelectorAll("button[name='cardbutton']")[card_index];
    show_card_on_button(cardbutton, card_value);
  }
}

function reset_board(player_names) {
  // clean up player boards
  while (gameboard.hasChildNodes())
    gameboard.removeChild(gameboard.firstChild);
  // add fresh player boards and bind new buttons
  player_names.forEach((name, i) => {
    const clone = templates.playercards.content.cloneNode(true);
    clone.getElementById("gbname").textContent = name;
    clone.getElementById("totalpoints").id = `totalpoints${i}`;

    const table = clone.querySelector("table");
    table.id = `board${i}`;
    table.querySelectorAll("button[name='cardbutton']").forEach((card_button, j) => {
      card_button.onclick = event => on_click_player_card(event, i, j);
    });
    gameboard.appendChild(clone);
    update_player(i, false);
  });
}

function show_card_on_button(button, card_value) {
  const cardface = card_value.toString();
  button.textContent = cardface;
  button.classList.value = `cardbutton ${cardbackgrounds[cardface]}`;
}