'use strict';

const test = require('tape');
const bitterset = require('..');

test('empty', function(assert) {

  let bs = bitterset();

  assert.is(bs.length(), 0);
  assert.is(bs.cardinality(), 0);

  assert.end();

});

test('setting', function(assert) {

  let bs = bitterset();

  bs.set(0);

  assert.is(bs.get(0), true);
  assert.is(bs.length(), 1);
  assert.is(bs.cardinality(), 1);

  bs.set(31);

  assert.is(bs.get(31), true);
  assert.is(bs.length(), 32);
  assert.is(bs.cardinality(), 2);

  bs.set(32);

  assert.is(bs.get(32), true);
  assert.is(bs.length(), 33);
  assert.is(bs.cardinality(), 3);

  assert.end();

});


test('clearing', function(assert) {

  let bs = bitterset();

  bs.set(0);
  bs.set(31);

  assert.is(bs.length(), 32);
  assert.is(bs.cardinality(), 2);

  assert.end();

});

test('searching with a pip', function(assert) {

  let bs = bitterset();

  bs.set(16);

  let next = bs.forwards(true, 0).next();
  assert.is(next.value, 16);
  assert.is(next.done, true);

  next = bs.backwards(true, 32).next();
  assert.is(next.value, 16);
  assert.is(next.done, true);

  assert.end();

});

test('searching with a hole', function(assert) {

  let bs = bitterset();

  for (let i = 0; i < 32; i++) bs.set(i);
  bs.clear(16);

  // Forwwards

  let iter = bs.forwards(false, 0);

  let next = iter.next();
  assert.is(next.value, 16);

  // Forward search for a false value is infinite.
  next = iter.next();
  assert.is(next.value, 32);

  // Backwards

  iter = bs.backwards(false, 31);

  next = iter.next();
  assert.is(next.value, 16);
  assert.is(next.done, true);

  assert.end();

});

test('searching with a few words', function(assert) {

  let bs = bitterset();

  bs.set(0);
  bs.set(32);
  bs.set(47);
  bs.set(64);

  // Forwards

  let iter = bs.forwards(true, 0);

  let next = iter.next();
  assert.is(next.value, 0);

  next = iter.next();
  assert.is(next.value, 32);

  next = iter.next();
  assert.is(next.value, 47);

  next = iter.next();
  assert.is(next.value, 64);
  assert.is(next.done, true);

  // Backwards

  iter = bs.backwards(true, 64);

  next = iter.next();
  assert.is(next.value, 64);

  next = iter.next();
  assert.is(next.value, 47);

  next = iter.next();
  assert.is(next.value, 32);

  next = iter.next();
  assert.is(next.value, 0);
  assert.is(next.done, true);

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
