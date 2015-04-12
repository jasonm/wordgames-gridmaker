Gridmaker
=========

Generate grids of letters, aiming for a high density of words.

Example Usages
--------------

Try it out:

```bash
$ npm install
$ node example/index.js

 e  e  u  v  d  i  f  v  u  i  l  n  e  a  r  r  d  p  e  i  a  v  s  r  l  i  o  s  r  l  e  e  s  c  t  p  j  r  f  f
 s  p  m  d  e  e  r  e  c  l  e  d  l  l  s  e  l  a  o  r  l  y  e  d  e  d  n  n  t  e  j  o  p  o  s  o  e  o  o  i
 o  r  e  e  a  s  r  u  t  e  s  a  j  p  j  f  s  l  t  u  d  d  s  d  r  d  o  i  t  c  u  e  c  p  u  m  f  f  g  l
 e  t  s  r  i  r  e  a  d  p  n  m  n  r  i  c  e  l  m  d  s  i  u  o  a  c  n  e  t  p  l  c  r  d  r  a  t  h  o  s
 e  s  h  a  e  l  l  u  r  u  g  a  a  a  n  a  d  r  a  y  s  c  n  g  u  a  h  t  m  e  d  o  e  i  n  i  i  t  i  m
 c  c  i  g  l  n  r  y  s  e  h  r  k  l  m  l  c  l  l  s  h  i  r  t  r  g  l  e  e  y  n  i  s  d  c  a  t  c  o  t
 o  h  h  a  o  e  e  t  t  s  k  e  i  s  y  e  o  u  e  a  o  p  e  i  o  o  e  d  e  d  g  e  e  o  e  l  l  e  k  r
 f  o  l  g  i  g  h  o  h  i  s  q  c  d  r  b  n  d  r  a  l  n  e  g  h  s  b  s  p  d  i  a  w  s  l  o  s  e  e  i
 t  p  r  n  o  t  o  d  i  t  o  t  a  a  a  i  t  t  d  r  t  i  o  n  t  c  l  o  i  i  i  s  i  m  s  d  t  r  n  s
 q  e  e  o  d  c  n  a  e  n  f  y  b  s  t  a  e  s  r  c  e  h  o  o  o  o  s  g  v  d  t  o  p  l  i  k  y  d  u  i
5475
```

This generated the above 40x10 grid of letters.  Using a
[solver](https://github.com/BinaryMuse/boggle-solver) based on
`/usr/share/dict/words`, the grid contains 5475 words.

Or make some grids yourself:

```javascript
var seedWords = fs.readFileSync('./norvig/spacey_1000.txt'),
    GridMaker = require("./gridmaker"),
    gridMaker = new GridMaker({ width: 40, words: seedWords });

gridMaker.ready(function() {
  var grid = [];
  for (var i = 0; i < 10; i++) {
    grid.push(gridMaker.generateRow(grid));
  }
});
```

Method
------

To generate a grid, first bootstrap with one row.

To genearate subsequent rows, build them one character at a time, left-to-right.

For each character in the new row, generate all inbound paths of length N;
paths starting in the existing grid and terminating at the new cell.  For each
path, take the existing letters along the path, and use a Markov chain text
generator to generate a new candidate letter.  For K inbound paths, you now
have K candidate letters for the new cell.  Pick one randomly.

An improvement would draw weights from all Markov candidates along all inbound
paths and sample from the full set of Markov candidates, rather than picking
one candidate per inbound path and sampling from those.

See [notes](notes.txt) on how different methods compare, including
context-free Markov generation (e.g. the method used to bootstrap the first row),
random letter selection following English language letter distribution, and
pure random letter selectoin.
