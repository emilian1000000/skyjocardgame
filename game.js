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

const cardbackgrounds = {
  "-2": "negativebg", 
  "-1": "negativebg", 
  0: "zerobg", 
  1: "onetwothreefourbg",
  2: "onetwothreefourbg",
  3: "onetwothreefourbg",
  4: "onetwothreefourbg",
  5: "fivesixseveneightbg",
  6: "fivesixseveneightbg",
  7: "fivesixseveneightbg",
  8: "fivesixseveneightbg",
  9: "nineteneleventwelvebg",
  10: "nineteneleventwelvebg",
  11: "nineteneleventwelvebg",
  12: "nineteneleventwelvebg"
};

const fulldeck = [-2, -2, -2, -2, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12];

const MAX_PLAYERS = 8;

function Game(playernames) {
  console.log(`New SKYJO game with ${playernames.length} players`)
  this.cards = fulldeck.slice(); // copy
  shuffle(this.cards);
  this.playernames = playernames.slice();
  shuffle(this.playernames);
  this.playerscards = this.playernames.map(_ => []); // empty array for each player
  this.opencards = [];
  this.move = 0; // increases after every open card
  this.ending_move = null;
}
Game.prototype = {
  deal_cards: function() {
    for (let i = 0; i < 12; i++) {
      for (let j in this.playernames) {
        this.playerscards[j].push({
          card: this.cards.pop(), 
          open: false
        });
      }
    };
    this.opencards.push(this.cards.pop());
  },
  player_cards_open: function (player_index) {
    return this.playerscards[player_index].reduce(
      (sum, item) => item.open ? sum + 1 : sum, 0
    );
  },
  player_points: function (player_index) {
    return this.playerscards[player_index].reduce(
      (sum, item) => item.open ? sum + item.card : sum, 0
    );
  },
  last_open: function () {
    return this.opencards[this.opencards.length - 1];
  },
  _open_card: function (player_index, card_index) {
    this.playerscards[player_index][card_index].open = true;
    if (this.playerscards[player_index].length == this.player_cards_open(player_index))
      this.ending_move = this.move;

    ++this.move;
  },
  open_if_closed: function (player_index, card_index) {
    if (this.playerscards[player_index][card_index].open)
      return false;
    this._open_card(player_index, card_index);
    return true;
  },
  is_card_open: function (player_index, card_index) {
    return this.playerscards[player_index][card_index].open;
  },
  open_all_cards: function () {
    for (player_index in this.playerscards) {
      for (card_index in this.playerscards[player_index]) {
        this.playerscards[player_index][card_index].open = true;
      }
    }
  },
  player_card: function (player_index, card_index) {
    return this.playerscards[player_index][card_index].card;
  },
  is_debut_complete: function () {
    // every player has at least two open cards
    return this.move == 2 * this.playernames.length;
  },
  is_last_round: function () {
    return this.ending_move != null;
  },
  is_mittelspiel_complete: function () {
    return this.ending_move != null && this.move - this.ending_move == this.playernames.length;
  },
  current_player: function () {
    return this.move % this.playernames.length;
  },
  previous_player: function () {
    return (this.move - 1) % this.playernames.length;
  },
  deck_to_open: function () {
    this.opencards.push(this.cards.pop());
    console.log(`Deck (${this.cards.length}) to open (${this.opencards.length})`);
  },
  swap_with_open: function (player_index, card_index) {
    const card = this.playerscards[player_index][card_index].card;
    this.playerscards[player_index][card_index].card = this.opencards.pop();
    this._open_card(player_index, card_index);
    this.opencards.push(card);
  },
  forEachPlayer: function(callback) {
    // for now, do final score calculation here
    const allpoints = this.playerscards.map((_, player_index) => this.player_points(player_index));
    if (this.ending_move != null) {
      const ender = this.ending_move % this.playernames.length;
      /*
        The first player to open all cards keeps their total only if 
        it is the lowest and no other player has the same or lower 
        total
      */
      if (allpoints.some((points, player_index) => player_index != ender && points <= allpoints[ender])) {
        console.log(`Player ${ender} doubles total (oOfIeS)`);
        allpoints[ender] *= 2;
      }
    }

    // invoke callback
    this.playerscards.forEach((player_cards, player_index) => {
      callback(
        this.playernames[player_index],
        allpoints[player_index],
        player_cards.map(i => i.open ? i.card : null),
        player_index
      )
    });
  }
}