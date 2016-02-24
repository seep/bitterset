'use strict';

// Poor man's decomposition.
const util      = require('./util');
const position  = util.position;
const weight    = util.weight;
const lowest    = util.lowest;
const highest   = util.highest;
const stringify = util.stringify;

// The number of bits pre word.
const WORD_BITS = 32;

// The number of bits to shift a bit index to get a word index.
const ADDR_BITS = 5;

const EMPTY_WORD = 0x0;
const FULL_WORD = 0xffffffff;

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
  let bitindex = start % ADDR_BITS;

  // We have to keep track of the next (real) result of the generator, as well
  // as a peek at the value after that. This is we can return instead of yield
  // the last value.
  let prev = null;

  // A fowards search for a false value will never end. A forward search for a
  // true value can only go to the end of the store.
  while (value === false || wordindex < this.store.length) {

    // Is this the final loop?
    let final = (value === true) && (wordindex === this.store.length - 1);

    // The store is sparse, so account for undefined words.
    let word = this.store[wordindex] || 0;

    // If we're looking for a false value, flip the whole word. This just
    // eliminates most of the branching in the loop.
    if (!value) word = ~word;

    // Skip words that have no bits at all, and skip bits outside the word.
    while (word !== 0 && bitindex < WORD_BITS) {

      // Mask the word  with no leading zeroes.
      // bitindex == 4
      // bit      == 0b00010000
      // mask     == 0b11110000
      let bit = 1 << bitindex;
      let mask = ~(bit - 1);
      word = word & mask;

      let offset = lowest(word);
      let result = wordindex * WORD_BITS + offset;

      if (final && offset >= WORD_BITS) {

        // The last word is a special case. An offset greater than the word bits
        // means this value is off the end of the set. We have to return
        // (instead of yield) the last value
        return prev;

      } else if (prev !== null && offset < WORD_BITS) {

        yield prev;
        prev = result;

      } else if (offset < WORD_BITS) {

        prev = result;

      }

      bitindex = offset + 1;

    }

    bitindex = 0;
    ++wordindex;

  }

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
  let prev = null;

  while (wordindex >= 0) {

    let final = wordindex === 0;

    let word = this.store[wordindex] || 0;
    if (!value) word = ~word;

    while (word !== 0 && bitindex >= 0) {

      let bit = 1 << bitindex;
      let mask = ((bit - 1) << 1) + 1;
      word = word & mask;

      let offset = highest(word);
      let result = wordindex * WORD_BITS + offset;

      if (final && result === 0) {

        if (word & 1 === 1) { yield prev; return result; }
        else return prev;

      } else if (prev !== null && offset < WORD_BITS) {

        yield prev;
        prev = result;

      } else if (offset < WORD_BITS) {

        prev = result;

      }

      bitindex = offset - 1;

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
