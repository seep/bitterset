'use strict';

// Poor man's decomposition.
const util      = require('./util');
const weight    = util.weight;
const stringify = util.stringify;

// The number of bits pre word.
const WORD_BITS = 32;

// The number of bits to shift a bit index to get a word index.
const ADDR_BITS = 5;

/**
 * Construct a new bitset.
 */
function bitterset() {

  // newless constructor
  if (!(this instanceof bitterset)) return new bitterset();

  this.store = [];

}

module.exports = bitterset;

/**
 * Get the value of a bit.
 */
bitterset.prototype.get = function(index) {

  let value = this.store[index >> ADDR_BITS] & (1 << index);
  return value !== 0x0;

}

/**
 * Set the value of a bit.

 * @param index - The index of the bit.
 * @param value - The value to set the bit to. Defaults to true.
 */
bitterset.prototype.set = function(index, value) {

  if (value === undefined) value = true;

  // In JavaScript, the bitwise left shift only uses the low 5 bits. In other
  // words, it automatically modulates by 32.

  if (value) {

    this.store[index >> ADDR_BITS] |= (1 << index);

  } else {

    this.store[index >> ADDR_BITS] &= ~(1 << index);

  }

}

/**
 * Set one or all of the bits in the set to false.

 * @param index - The index of the bit.
 */
bitterset.prototype.clear = function(index) {

  if (index === undefined) {

    this.store = [];

  } else {

    this.set(index, false);

  }

}

/**
 * Flip the value of a bit.

 * @param index - The index of the bit.
 */
bitterset.prototype.flip = function(index) {

  this.store[index >> ADDR_BITS] ^= (1 << index);

}

/**
 * Returns a forward iterator over the bitset that will yield the next set or
 * unset bit.
 *
 * @param value - True to iterate over set bits, false to iterate over clear bits.
 */
bitterset.prototype.forwards = function*(value, start) {

  if (start === undefined) start = 0;

  // The index of the first word to look at.
  let wordindex = start >> ADDR_BITS;

  // The index of the first bit in the word to look at.
  let bitindex = start % WORD_BITS;

  while (wordindex < this.store.length) {

    let word = this.store[wordindex] || 0;

    // If we're looking for a false value, flip the whole word.
    if (!value) word = ~word;

    // Skip words that don't have _any_ valid bits.
    let valid = word !== 0x0;

    // TODO could this be sped up by continually masking out the last returned
    // bit and using a bitshift op to find the highest/lowest bit.
    while (valid && bitindex < WORD_BITS) {

      let mask = 1 << bitindex;
      if (word & mask) yield (wordindex * WORD_BITS) + bitindex;

      ++bitindex;

    }

    bitindex = 0;
    ++wordindex;

  }

  // If we're looking for a set bit, and have checked all of the words in the
  // store, return the error bit. In contrast, is always another unset bit
  // (until the store overflows).
  return value ? -1 : (this.store.length * WORD_BITS);

}

/**
 * Returns the index of the first set or clear bit before or on the starting
 * index. If no such bit exists, returns -1.
 *
 * @param set - True for the previous set bit, false for the previous clear bit.
 */
bitterset.prototype.backwards = function*(value, start) {

  // This is largely similar to bitterset#next. Refer to the comments there.

  if (start === undefined) start = (this.store.length * WORD_BITS);

  let wordindex = start >> ADDR_BITS;
  let bitindex = start % WORD_BITS;

  while (wordindex >= 0) {

    let word = this.store[wordindex] || 0;
    if (!value) word = ~word;

    let valid = word !== 0x0;

    while (valid && bitindex >= 0) {

      let mask = 1 << bitindex;
      if (word & mask) yield (wordindex * WORD_BITS) + bitindex;

      --bitindex;

    }

    bitindex = WORD_BITS - 1;
    --wordindex;

  }

  // Unlike the `next` function, there is no special logic here for unset bits;
  // if there are no previous bits left, just return the error index.
  return -1;

}

/**
 * Returns the logical length of the bitset (the index of the highest bit,
 * plus one).
 */
bitterset.prototype.length = function() {

  // We need to cull the word store so that the last word in the store is
  // a significant one.
  this.cull();

  if (this.store.length === 0) return 0;

  let fill = (this.store.length - 1) * WORD_BITS;
  let tail = stringify(this.store[this.store.length - 1]).length;

  return fill + tail;

}

/**
 * Returns the cardinality of the bitset (the number of bits set to true).
 */
bitterset.prototype.cardinality = function() {

  let reducer = (sum, word) => sum + weight(word);
  return this.store.reduce(reducer, 0)

}

/**
 * Remove any empty words from the end of the bitset.
 */
bitterset.prototype.cull = function() {

  while (this.store.length > 0) {

    let tail = this.store[this.store.length - 1];

    if (tail) break;
    this.store.pop();

  }

}

/**
 * Perform a logical OR against this bitset.
 *
 * @param that - The other bitset.
 */
bitterset.prototype.or = function(that) {

  // The logical OR is idempotent.
  if (this === that) return;

  // Since OR is an additive operation, we only need to operate on the words
  // defined by the other set. If the other set has more words than this set,
  // the OR-equals will silently operate using 0 for the LHS and add the new
  // word to the store. If the other set has less words than this set, we don't
  // need to operate on our extra words (because we would be ORing against 0,
  // which does nothing).

  for (let i = 0; i < that.store.length; i++) {

    this.store[i] |= that.store[i];

  }

}

/**
 * Perform a logical AND against this bitset.
 *
 * @param that - The other bitset.
 */
bitterset.prototype.and = function(that) {

  // The logical AND is idempotent.
  if (this === that) return;

  // Compared to the OR operation, the AND operation requires an extra
  // condition. This time, we operate on the words defined by our own set. If
  // the other set has more words than this set, the AND operation would result
  // in 0, so we avoid adding empty words to our store. If the other set has
  // less words than this set, we need to explicitly  operate using 0 for the
  // RHS. Because there is a possibility that we end up with empty words, we
  // end the function with a cull.

  for (let i = 0; i < this.store.length; i++) {

    this.store[i] &= (that.store[i] || 0);

  }

  this.cull();

}

/**
 * Perform a logical AND against this bitset, with the complement of the given
 * bitset.
 *
 * @param that - The other bitset.
 */
bitterset.prototype.andnot = function(that) {

  // The logical AND of a set's own compliment is the empty set.
  if (this === that) return this.clear();

  for (let i = 0; i < this.store.length; i++) {

    this.store[i] &= (~that.store[i] || 0);

  }

  this.cull();

}

/**
 * Perform a logical XOR against this bitset.
 *
 * @param that - The other bitset.
 */
bitterset.prototype.xor = function(that) {

  // The logical XOR of a set against itself is the empty set.
  if (this === that) return this.clear();

  for (let i = 0; i < that.store.length; i++) {

    this.store[i] ^= that.store[i];

  }

  this.cull();

}
