'use strict';

const benchmark = require('benchmark');
const bitterset = require('..');

const log = event => console.log(String(event.target));

const dense = bitterset();

for (let i = 0; i < 100000; i++) {
  let bitindex = Math.floor(Math.random() * 1000000);
  dense.set(bitindex);
}

const sparse = bitterset();

for (let i = 0; i < 100; i++) {
  let bitindex = Math.floor(Math.random() * 1000000);
  sparse.set(bitindex);
}

const worst = bitterset();

worst.set(1000000);

function test(set) {

  let iter = set.forwards(true);
  return () => { if (iter.next().done) iter = set.forwards(true) };

}

benchmark('bitterset#forwards (dense)', test(dense))
  .on('complete', log)
  .run();

benchmark('bitterset#forwards (sparse)', test(dense))
  .on('complete', log)
  .run();

benchmark('bitterset#forwards (worst)', test(worst))
  .on('complete', log)
  .run();
