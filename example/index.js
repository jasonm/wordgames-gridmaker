var fs = require('fs'),
    _ = require("lodash"),
    // "a b c\nd e f\n..."
    seedWords = fs.readFileSync('./norvig/spacey_1000.txt'),
    GridMaker = require("../gridmaker"),
    gridMaker = new GridMaker({ width: 40, words: seedWords });

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

var data = require("./trie-data.json"),
    Traverser = require("./traverser"),
    Trie = require("./trie");

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

gridMaker.ready(function() {
  var grid = [];
  // grid.push(gridMaker.generateContextFreeRow());
  // grid.push(gridMaker.generateContextFreeRow());
  for (var i = 0; i < 10; i++) {
    grid.push(gridMaker.generateRow(grid));
  }
  printGrid(grid);
  findWords(grid);
});
