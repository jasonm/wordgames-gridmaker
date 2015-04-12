var Traverser = require("./traverser");
var Trie = require("./trie");
var data = require("./data.json");
var _ = require("lodash");
var Combinatorics = require('js-combinatorics').Combinatorics;

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
    // console.log(grid[i].join(" "));
    var row = grid[i];
    var mapped = _.map(row, function(item) {
      if (!_.isNumber(item) || item < 10) {
        return " " + item;
      }
      return item;
    });
    console.log(mapped.join(" "));
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

// function gridFromMarkov(cb) {
//   var fs = require('fs');
//   var markov = require('markov');
//   var m = markov(1);
//   var s = fs.createReadStream(__dirname + '/norvig/spacey_1000.txt');
//   var grid = [];
//   var width = 40;
// 
//   function markovLine() {
//       var line = [];
//       while (line.length < width) {
//         var more = m.fill(m.pick(), width);
//         line = _.flatten([line, more]);
//       }
//       return _.take(line, width);
//   }
// 
//   m.seed(s, function() {
//     for (var i = 0; i < 10; i++) {
//       grid.push(markovLine());
//     }
//     cb(grid);
//   });
// };
// 
// console.log("letters by markov");
// gridFromMarkov(function(grid) {
//   printGrid(grid);
//   findWords(grid);
// });

function gridFromIncrMarkov(cb) {
  function inboundPaths(row, col, grid, n) {
    // starting at origin X, find inbound paths of length n:
    // .............
    // ......o......
    // .....ooo.....
    // ....ooooo....
    // ...oooXooo...
    // ....ooooo....

    // A move is a tuple of [row offset, column offset]
    var moves = [
      [-1,  0], // up
      [ 1,  0], // down
      [ 0, -1], // left
      [ 0,  1], // right
      [-1, -1], // upleft
      [ 1, -1], // downleft
      [-1,  1], // upright
      [ 1,  1], // downright
    ];

    // A path is a set of positions.
    //
    // Compute by starting at a [row, column] origin
    // and then advancing along a set of moves.
    //
    // We then drop the initial [row, column] origin and
    // reverse the set of positions, which gives us
    // the inbound path exclusive of the origin.
    function findInboundPath(moves) {
      return _.rest(_.reduce(moves, function(positionsAcc, move) {
        positionsAcc.push([_.last(positionsAcc)[0] + move[0],
                           _.last(positionsAcc)[1] + move[1]]);
        return positionsAcc;
      }, [[row, col]])).reverse();
    }

    // A position is reachable if it is inside the grid
    function reachable(position) {
      return position[0] >= 0 && grid.length > position[0] && // row is reachable
             position[1] >= 0 && grid[0].length > position[1]; // column is reachable
    }

    function pathReachable(path) {
      return _.all(path, reachable);
    }

    // Deep compare arrays using string representation
    function canonicalizeArray(array) {
      return "" + array;
    };

    function pathNoncrossing(path) {
      var uniquePositions = _.unique(path, false, canonicalizeArray);
      return path.length === uniquePositions.length
    }

    function pathExcludesOrigin(path) {
      return  _.all(path, function(position) {
        return ! (position[0] === row && position[1] === col);
      });
    }

    var movelists = Combinatorics.baseN(moves, n).toArray();
    var paths = _.map(movelists, findInboundPath);

    return _.select(paths, function(path) {
      return pathReachable(path) && pathNoncrossing(path) && pathExcludesOrigin(path);
    });
  }

  var markovOrder = 2;
  var fs = require('fs');
  var markov = require('markov');
  var m = markov(markovOrder);
  var m1 = markov(1);
  // var s = fs.createReadStream(__dirname + '/norvig/spacey_1000.txt');
  function getWords() {
    return fs.createReadStream('/Users/jason/dev/wordgames/gridmaker/norvig/spacey_1000.txt');
  }
  var grid = [];
  var width = 40;

  function independentMarkovLine() {
    var line = [];
    while (line.length < width) {
      var more = m1.fill(m1.pick(), width);
      line = _.flatten([line, more]);
    }
    return _.take(line, width);
  }

  var util = require("util");
  function log(x) {
    console.log(util.inspect(x, false, null));
  }


  m.seed(getWords(), function() {
    m1.seed(getWords(), function() {
      // var pick = m.pick();
      // console.log(pick);
      // console.log(m.next("e_n_v"));
      // throw "asdf";

      // TODO for some reason this is destructive
      // function drawFreqs(inb, grid1) {
      //   _.each(inb, function(path) {
      //     _.each(path, function(position) {
      //       grid1[position[0]][position[1]] = 0;
      //     });
      //   });
      //   _.each(inb, function(path) {
      //     _.each(path, function(position) {
      //       grid1[position[0]][position[1]] = grid1[position[0]][position[1]] + 1;
      //     });
      //   });
      //   printGrid(grid1);
      // }

      function genByInbound(row, col) {
        var inb = inboundPaths(row, col, grid, markovOrder);
        var markovKeys = _.map(inb, function(path) {
          return _.map(path, function(position) {
            return grid[position[0]][position[1]];
          }).join("_");
        });
        var generateds = _.map(markovKeys, function(key) {
          var next = m.next(key);
          return next && next.word && next.word[0];
        });
        var choices = _.without(generateds, undefined);
        // drawFreqs(inb, _.clone(grid));
        // log(_.zip(inb, markovKeys, generateds));
        // log(choices);
        // console.log("");
        return _.sample(choices) || m1.pick() || 'a'; // TODO: why default
      }

      // seed grid with one line
      grid.push(independentMarkovLine());

      function genRowByInbound() {
        var row = [];
        for (var col = 0; col < width; col++) {
          row.push(genByInbound(grid.length, col));
        }
        return row;
      }
      _.times(9, function() {
        grid.push(genRowByInbound());
      });

      cb(grid);
    });
  });
};


// console.log("letters by incremental markov");
gridFromIncrMarkov(function(grid) {
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
