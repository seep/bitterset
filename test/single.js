'use strict';

const test = require('tape');
const bitterset = require('..');

test('a new bitset', function(assert) {

  let bs = bitterset();

  assert.is(bs.length(), 0);
  assert.is(bs.cardinality(), 0);

  assert.same(bs.indexes(), []);

  assert.end();

});

test('setting', function(assert) {

  let bs = bitterset();

  bs.set(0);

  assert.is(bs.get(0), true);
  assert.is(bs.length(), 1);
  assert.is(bs.cardinality(), 1);
  assert.same(bs.indexes(), [0]);

  bs.set(31);

  assert.is(bs.get(31), true);
  assert.is(bs.length(), 32);
  assert.is(bs.cardinality(), 2);
  assert.same(bs.indexes(), [0, 31]);

  bs.set(32);

  assert.is(bs.get(32), true);
  assert.is(bs.length(), 33);
  assert.is(bs.cardinality(), 3);
  assert.same(bs.indexes(), [0, 31, 32]);

  assert.end();

});


test('clearing', function(assert) {

  let bs = bitterset();

  bs.set(0);
  bs.set(31);

  assert.is(bs.length(), 32);
  assert.is(bs.cardinality(), 2);

  assert.same(bs.indexes(), [0, 31]);

  assert.end();

});

test('searching with a pip', function(assert) {

  let bs = bitterset();

  bs.set(16);

  assert.is(bs.next(true, 0), 16);
  assert.is(bs.next(true, 16), 16);
  assert.is(bs.previous(true, 17), 16);
  assert.is(bs.previous(true, 32), 16);

  assert.end();

});

test('searching with a hole', function(assert) {

  let bs = bitterset();

  for (let i = 0; i < 16; i++) bs.set(i);
  for (let i = 17; i < 32; i++) bs.set(i);

  assert.is(bs.next(false, 0), 16);
  assert.is(bs.next(false, 16), 16);
  assert.is(bs.previous(false, 31), 16);
  assert.is(bs.previous(false, 32), 32);

  assert.end();

});

test('searching with two words', function(assert) {

  let bs = bitterset();

  bs.set(0);
  bs.set(32);

  assert.is(bs.next(true, 0), 0);
  assert.is(bs.next(true, 1), 32);
  assert.is(bs.next(true, 33), -1);

  assert.is(bs.previous(true, 0), 0);
  assert.is(bs.previous(true, 31), 0);
  assert.is(bs.previous(false, 0), -1);
  assert.is(bs.previous(false, 1), 1);
  assert.is(bs.previous(false, 32), 31);
  assert.is(bs.previous(false, 33), 33);

  assert.end();

});

test('culling', function(assert) {

  let bs = bitterset();

  bs.set(0);
  bs.set(32);
  assert.is(bs.store.length, 2);

  bs.clear(32);
  bs.cull();
  assert.is(bs.store.length, 1);

  bs.clear(0);
  bs.cull();
  assert.is(bs.store.length, 0);

  assert.end();

});

test('flipping', function(assert) {

  let bs = bitterset();

  bs.flip(0);

  assert.is(bs.get(0), true);
  assert.is(bs.length(), 1);
  assert.is(bs.cardinality(), 1);

  bs.flip(0);

  assert.is(bs.get(0), false);
  assert.is(bs.length(), 0);
  assert.is(bs.cardinality(), 0);

  assert.end();

});
