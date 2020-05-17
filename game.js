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

function Player(name) {
  console.log(`new SKYJO player: ${name}`)
  this.name = name;
  this.cards = [];
}
Player.prototype = {
  deal_card: function(value) {
    this.cards.push({
      "value": value,
      open: false
    });
  },
  count_open: function() {
    return this.cards.reduce((sum, card) => card.open ? sum + 1 : sum, 0);
  },
  sum_open: function() {
    return this.cards.reduce((sum, card) => card.open ? sum + card.value : sum, 0);
  },
  is_open: function(card_index) {
    return this.cards[card_index].open;
  },
  open_one: function(card_index) {
    this.cards[card_index].open = true;
    return this.cards.length == this.count_open();
  },
  open_all: function() {
    this.cards.forEach(card => card.open = true);
  },
  card_one: function(card_index) {
    return this.cards[card_index].value;
  },
  card_all: function() {
    return this.cards.map(card => card.open ? card.value : null);
  },
  swap: function(card_index, value) {
    // dEsTrUcTuRiNg!
    [this.cards[card_index].value, value] = [value, this.cards[card_index].value];
    return value;
  }
};

function Game(playernames) {
  console.log(`new SKYJO game with ${playernames.length} players`)
  this.cards = fulldeck.slice(); // copy
  shuffle(this.cards);
  names = playernames.slice(); // copy, just in case
  shuffle(names);
  this.players = names.map(name => new Player(name));
  this.opencards = [];
  this.move = 0; // increases after every open card
  this.ending_move = null;
}
Game.prototype = {
  player_names: function() {
    return this.players.map(player => player.name);
  },
  deal_cards: function() {
    for (let i = 0; i < 12; i++)
      this.players.forEach(player => player.deal_card(this.cards.pop()))

    this.opencards.push(this.cards.pop());
  },
  player_cards_open: function (player_index) {
    return this.players[player_index].count_open();
  },
  player_points: function (player_index) {
    return this.players[player_index].sum_open();
  },
  last_open: function () {
    return this.opencards[this.opencards.length - 1];
  },
  _open_card: function (player_index, card_index) {
    if (this.players[player_index].open_one(card_index)) {
      console.log(`Player ${player_index} opened all cards on move ${this.move}`);
      this.ending_move = this.move;
    }

    ++this.move;
  },
  open_if_closed: function (player_index, card_index) {
    if (this.players[player_index].is_open(card_index))
      return false;

    this._open_card(player_index, card_index);
    return true;
  },
  is_card_open: function (player_index, card_index) {
    return this.players[player_index].is_open(card_index);
  },
  open_all_cards: function () {
    this.players.forEach(player => player.open_all());
  },
  player_card: function (player_index, card_index) {
    return this.players[player_index].card_one(card_index);
  },
  is_debut_complete: function () {
    // every player has at least two open cards
    return this.move == 2 * this.players.length;
  },
  is_last_round: function () {
    return this.ending_move != null;
  },
  is_mittelspiel_complete: function () {
    return this.ending_move != null && this.move - this.ending_move == this.players.length;
  },
  current_player: function () {
    return this.move % this.players.length;
  },
  previous_player: function () {
    return (this.move - 1) % this.players.length;
  },
  deck_to_open: function () {
    this.opencards.push(this.cards.pop());
    console.log(`Deck (${this.cards.length}) to open (${this.opencards.length})`);
  },
  swap_with_open: function (player_index, card_index) {
    this.opencards.push(this.players[player_index].swap(card_index, this.opencards.pop()));
    this._open_card(player_index, card_index);
  },
  forEachPlayer: function(callback) {
    // for now, do final score calculation here
    const allpoints = this.players.map(player => player.sum_open());
    if (this.ending_move != null) {
      const ender = this.ending_move % this.players.length;
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
    this.players.forEach((player, player_index) => {
      callback(
        player.name,
        allpoints[player_index],
        player.card_all(),
        player_index
      )
    });
  }
}