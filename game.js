// Shuffle tool
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
function Game(playernames) {
  console.log(`New SKYJO game with ${playernames.length} players`)
  this.cards = fulldeck.slice();
  shuffle(this.cards);
  this.playernames = playernames.slice();
  shuffle(this.playernames);
}
Game.prototype = {
  dealcards: function() {
    this.playerscards = [];
    for (let i = 0; i < 12; i++) {
      for (let j in this.playernames) {
        if (i == 0)
          this.playerscards[j] = [];
        this.playerscards[j].push({
          card: this.cards.pop(), 
          open: false
        });
      }
    };
    this.opencards = [this.cards.pop()];
  },
  player_cards_open: function (playerIndex) {
    return this.playerscards[playerIndex].reduce(
      (sum, item) => item.open ? sum + 1 : sum, 0
    );
  },
  player_points: function (playerIndex) {
    return this.playerscards[playerIndex].reduce(
      (sum, item) => item.open ? sum + item.card : sum, 0
    );
  },
  last_open: function () {
    return this.opencards[this.opencards.length - 1].toString();
  },
  open_if_closed: function (playerIndex, cardIndex) {
    if (this.playerscards[playerIndex][cardIndex].open)
      return false;

    this.playerscards[playerIndex][cardIndex].open = true;
    return true;
  },
  player_card: function (playerIndex, cardIndex) {
    return this.playerscards[playerIndex][cardIndex].card.toString()
  },
  is_debut_complete: function () {
    for (i in this.playerscards) {
      if (player_cards_open(i) != 2) 
        return false;
    }
    return true;
  }
}
