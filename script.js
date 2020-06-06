'use strict';

const templates = {
  playername: document.getElementById("player-name"),
  playercards: document.getElementById("player-cards")
};
const players_form = document.getElementById("players-form");
const gameboard = document.getElementById("gameboard");
const new_game = document.getElementById("new-game");
const deck = document.getElementById("deck");
const open_card = document.getElementById("open-card");
const endspiel_notifier = document.getElementById("endspielnotifier")
for (let i = 0; i < MAX_PLAYERS; i++) {
  const clone = templates.playername.content.cloneNode(true);
  players_form.appendChild(clone);
}

var gAmE = null;
var pick = null;
const score = {};
var phases = [
  /*
     DEBUT
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
        Array.from(document.forms.players.playernames, input => input.value.trim()).filter(name => name != "")
      );
      gAmE.deal_cards();
      show_card_on_button(open_card, gAmE.last_open());
      reset_board(gAmE.player_names());

      // TODO
      fetch(
        "https://www.optimaltec.com/game/sessions",
        {
          body: JSON.stringify({x: 5, y: 6}),
          method: "POST",
          mode: "cors"
        }
      ).then(response => {
        console.log("got an answer", response.ok, response.status)
      });
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
     MITTELSPIEL & ENDSPIEL
     Mittelspiel: Players take turns until one opens all their cards
     Endspiel: All players take one last turn and at the end open all their cards
  */
  {
    finish: function() {
      // next turn already advanced to the player
      if (gAmE.is_last_round())
        endspiel_notifier.classList.remove("invisible"); // show

      if (!gAmE.is_mittelspiel_complete())
        return false;

      gAmE.open_all_cards(); // change all cards to val open
      gAmE.forEachPlayer((name, points, cards, player_index) => {
        if (name in score)
          score[name] += points;
        else 
          score[name] = points;

        update_player(player_index, false, points);
        _card_buttons(_player_board(player_index)).forEach((card_button, card_index) =>
          show_card_on_button(card_button, cards[card_index])
        );
      });
      endspiel_notifier.classList.add("invisible"); // hide again
      return true;
    },
    click_new_game: function() {
      // game in progress
    },
    click_player_card: function(player_index, card_index) {
      if (gAmE.current_player() != player_index) {
        alert("pLeAsE wAiT fOr YoUr TuRn");
        return;
      }
      if (pick) {
        const question = `Press OK to swap the card with the open card ${gAmE.last_open()} or Cancel to open the card`;
        const swap = 
          pick == "open"
          || gAmE.is_card_open(player_index, card_index)
          || confirm(question);
        if (swap) {
          gAmE.swap_with_open(player_index, card_index);
          show_card_on_button(open_card, gAmE.last_open());
        }
        else
          gAmE.open_if_closed(player_index, card_index);
        
        // Update player's button
        update_player(
          player_index,
          false,
          gAmE.player_points(player_index),
          card_index,
          gAmE.player_card(player_index, card_index)
        );
        
        const column = gAmE.remove_three_in_a_column(player_index, card_index);
        if (column != null) {
          const tbody = _player_board(player_index).querySelector("tbody");
          Array.from(tbody.rows).forEach((row, row_index) => {
            if (row_index < 3)
              row.deleteCell(column);
          });
          show_card_on_button(open_card, gAmE.last_open());
          update_player(
            player_index,
            false,
            gAmE.player_points(player_index)
          );
        }

        update_player(gAmE.current_player(), true);
        open_card.classList.remove("cardpicked");
        pick = null;
      }
    },
    click_deck_card: function() {
      if (!pick) {
        gAmE.deck_to_open();
        show_card_on_button(open_card, gAmE.last_open());
        //open_card.classList.add("cardpicked");
        pick = "deck";
      }
    },
    click_open_card: function() {
      // no need to check if "pick" is set, player chose this card
      open_card.classList.add("cardpicked");
      pick = "open";
    }
  },
  /*
     DATA COLLECTION & GAME RESTART
     We collect point data and restart the game w/ points in mind
  */
  {
    finish: function() {
      return !gAmE;
    },
    click_new_game: function() {
      // TODO update player standing
      update_totalpoints(score);
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
var phase_index = 0;

function phase() {
  return phases[phase_index];
}

function maybe_next_phase() {
  if (phases[phase_index].finish()) {
    // don't ever allow phases[phase_index] to be invalid
    const next = phase_index + 1;
    console.log(`phase ${phase_index} -> ${next}`);
    if (next < phases.length)
      phase_index = next;
    else {
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

function _player_board(player_index) {
  return document.getElementById(`board${player_index}`);
}

function _card_buttons(player_board) {
  return player_board.querySelectorAll("button[name='cardbutton']");
}

function update_player(player_index, current, points, card_index, card_value) {
  console.log(`update_player: ${current ? "!" : "#"}${player_index} has ${points} [${card_index}]=${card_value}`);

  if (points != undefined) {
    document.getElementById(`totalpoints${player_index}`).textContent = points.toString();
  }

  const player_board = _player_board(player_index);
  player_board.classList.value = `${player_index % 2 == 1 ? "altbackground" : ""} ${current ? "turn" : ""}`;

  if (card_index != undefined) {
    const cardbutton = _card_buttons(player_board)[card_index];
    show_card_on_button(cardbutton, card_value);
  }
}
function update_totalpoints(scoremap) {
  players_form.querySelectorAll('input').forEach(
    (input, index, all_inputs) => {
      if (index % 2 == 1) {
        const name = all_inputs[index - 1].value.trim();
        if (name != "") 
          input.value = scoremap[name].toString();
      }
    }
  );
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
    _card_buttons(table).forEach((card_button, j) => {
      card_button.onclick = event => {
        const allbuttons = _card_buttons(table);
        // find button that sent the event in the list
        for (var index in allbuttons) {
          if (allbuttons[index] == event.target)
            break;
        }
        on_click_player_card(event, i, index);
      }
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