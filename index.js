var Traverser = require("./traverser");
var Trie = require("./trie");
var data = require("./data.json");
var _ = require("lodash");

function lettersRandom() {
  var letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  return letters;
};

function lettersByFrequency() {
  var freqs = {
    "a": 8.167, "b": 1.492, "c": 2.782, "d": 4.253, "e": 12.702, "f": 2.228,
    "g": 2.015, "h": 6.094, "i": 6.966, "j": 0.153, "k": 0.772, "l": 4.025,
    "m": 2.406, "n": 6.749, "o": 7.507, "p": 1.929, "q": 0.095, "r": 5.987,
    "s": 6.327, "t": 9.056, "u": 2.758, "v": 0.978, "w": 2.360, "x": 0.150,
    "y": 1.974, "z": 0.074,
  }
  var letters = _.map(freqs, function(freq, letter) {
    return Array(1 + Math.ceil(freq * 10)).join(letter);
  }).join('').split('');
  return letters;
};

function gridFromLetters(letters, cb) {
  var grid = [];

  for (var i = 0; i < 10; i++) {
    var row = [];
    for (var j = 0; j < 40; j++) {
      row.push(letters[Math.floor(Math.random() * letters.length)]);
    }
    grid.push(row);
  }
  cb(grid);
};


function printGrid(grid) {
  for (var i = 0; i < grid.length; i++) {
    console.log(grid[i].join(""));
  }
}

function findWords(grid) {
  var found = {};
  var traverser = new Traverser(5, grid, new Trie(data));
  traverser.onComplete(function() {
    console.log(Object.keys(found).length);
  });
  traverser.search(function(word, positions) {
    found[word] = found[word] || [];
    found[word].push(positions);
  });
};

function gridFromMarkov(cb) {
  var fs = require('fs');
  var markov = require('markov');
  var m = markov(1);
  var s = fs.createReadStream(__dirname + '/norvig/spacey_1000.txt');
  var grid = [];
  m.seed(s, function() {
    for (var i = 0; i < 10; i++) {
      var line = [];
      while (line.length < 40) {
        var more = m.fill(m.pick(), 40);
        line = _.flatten([line, more]);
      }
      line = _.take(line, 40);
      grid.push(line);
    }
    cb(grid);
  });
};

console.log("letters by markov");
gridFromMarkov(function(grid) {
  printGrid(grid);
  findWords(grid);
});

// Found "word" at [ positions ]
//
// {
//   "xenon": [
//     [ [ 5, 19 ], [ 5, 18 ], [ 4, 17 ], [ 3, 18 ], [ 4, 19 ] ],
//     [ [ 5, 19 ], [ 5, 18 ], [ 4, 19 ], [ 3, 18 ], [ 4, 17 ] ]
//   ],
//   "yeast": [
//     [ [ 8, 22 ], [ 9, 23 ], [ 8, 24 ], [ 9, 25 ], [ 9, 24 ] ]
//   ]
// }

// var keys = Object.keys(found).sort();
// for (var i = 0; i < keys.length; i++) {
//   console.log(keys[i]);
//   console.log(found[keys[i]]);
// }
