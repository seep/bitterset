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

test('iterating with a pip', function(assert) {

  let bs = bitterset();

  bs.set(16);

  let forwards = bs.forwards(true, 0);
  assert.is(forwards.next().value, 16);
  assert.is(forwards.next().value, -1);

  let backwards = bs.backwards(true, 32);
  assert.is(backwards.next().value, 16);
  assert.is(backwards.next().value, -1);

  assert.end();

});

test('searching with a hole', function(assert) {

  let bs = bitterset();

  for (let i = 0; i < 32; i++) bs.set(i);
  bs.clear(16);

  let forwards = bs.forwards(false, 0);
  assert.is(forwards.next().value, 16);
  assert.is(forwards.next().value, 32);

  debugger;

  let backwards = bs.backwards(false, 31);
  assert.is(backwards.next().value, 16);
  assert.is(backwards.next().value, -1);

  assert.end();

});

test('searching with two words', function(assert) {

  let bs = bitterset();

  bs.set(0);
  bs.set(32);

  debugger;

  let forwards = bs.forwards(true, 0);
  assert.is(forwards.next().value, 0);
  assert.is(forwards.next().value, 32);
  assert.is(forwards.next().value, -1);

  let backwards = bs.backwards(true, 32);
  assert.is(backwards.next().value, 32);
  assert.is(backwards.next().value, 0);
  assert.is(backwards.next().value, -1);

  backwards = bs.backwards(false, 1);
  assert.is(backwards.next().value, 1);

  backwards = bs.backwards(false, 32);
  assert.is(backwards.next().value, 31);

  backwards = bs.backwards(false, 33);
  assert.is(backwards.next().value, 33);

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
