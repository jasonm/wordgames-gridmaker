var _ = require("lodash"),
    Combinatorics = require('js-combinatorics').Combinatorics,
    markov = require('markov');

function GridMaker(options) {
  this.width = options.width;
  this.words = options.words;
  this.markovOrder = options.markovOrder || 2;
}

GridMaker.prototype.ready = function(cb) {
  var self = this;
  self.markov = markov(self.markovOrder);
  self.markov1 = markov(1);

  self.markov.seed(self.words, function() {
    self.markov1.seed(self.words, function() {
      cb();
    });
  });
};

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

GridMaker.prototype.generateContextFreeRow = function() {
  var line = [];
  while (line.length < this.width) {
    var more = this.markov1.fill(this.markov1.pick(), this.width);
    line = _.flatten([line, more]);
  }
  return _.take(line, this.width);
};

GridMaker.prototype.generateContextSensitiveCell = function(grid, row, col) {
  var self = this;
  var inb = inboundPaths(row, col, grid, this.markovOrder);
  var markovKeys = _.map(inb, function(path) {
    return _.map(path, function(position) {
      return grid[position[0]][position[1]];
    }).join("_");
  });
  var generateds = _.map(markovKeys, function(key) {
    var next = self.markov.next(key);
    return next && next.word && next.word[0];
  });
  var choices = _.without(generateds, undefined);
  // TODO: why is the default needed
  return _.sample(choices) || this.markov1.pick() || 'a';
}

GridMaker.prototype.generateContextSensitiveRow = function(grid) {
  var row = [];
  for (var col = 0; col < this.width; col++) {
    row.push(this.generateContextSensitiveCell(grid, grid.length, col));
  }
  return row;
};

GridMaker.prototype.generateRow = function(grid) {
  if (grid.length === 0) {
    return this.generateContextFreeRow();
  } else {
    return this.generateContextSensitiveRow(grid);
  }
};

module.exports = GridMaker;
