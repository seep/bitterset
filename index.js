'use strict';

// Poor man's decomposition.
const util      = require('./util');
const position  = util.position;
const weight    = util.wieght;
const lowest    = util.lowest;
const highest   = util.highest;
const stringify = util.stringify;

// The number of bits pre word.
const WORD_BITS = 32;

// The number of bits to shift a bit index to get a word index.
const ADDR_BITS = 5;

/**
 * Construct a new bitset.
 */
module.exports = function bitterset() {

  // newless constructor
  if (!(this instanceof bitterset)) return new bitterset();

  this.store = [];

}

/**
 * Get the boolean value of a bit.
 */
bitterset.prototype.get = function(index) {

  let value = this.store[index >> ADDR_BITS] & (1 << index);
  return value !== 0x0;

}

/**
 * Set a bit to true.
 * @param index - The index of the bit.
 */
bitterset.prototype.set = function(index) {

    // In JavaScript, the bitwise left shift only uses the low 5 bits. In other
    // words, it automatically modulates by 32.
    this.store[index >> ADDR_BITS] |= (1 << index);

}

/**
 * Set a bit to false, or set all bits to false if no bit is specified.
 * @param index - The index of the bit.
 */
bitterset.prototype.clear = function(index) {

  if (index === undefined) {

    this.store = [];

  } else {

    this.store[index >> ADDR_BITS] &= ~(1 << index);

  }

}

/**
 * Flip the boolean value of a bit.
 * @param index - The index of the bit.
 */
bitterset.prototype.flip = function(index) {

  this.store[index >> ADDR_BITS] ^= (1 << index);

}

/**
 * Returns the index of the first set or clear bit after or on the starting
 * index. If no such bit exists, returns -1.
 *
 * @param set - True for the next set bit, false for the next clear bit.
 */
bitterset.prototype.next = function(set, start) {

  let wordindex = (start >> ADDR_BITS);
  let word      = this.store[wordindex] || 0;
  let bit       = 1 << start;

  // The mask is the bit with no leading zeroes.
  // bit  == 0b00010000
  // mask == 0b11110000
  let mask = ~(bit - 1);

  // If we are looking for a set bit, we need to zero-fill everything less than
  // the index. If we are looking for a clear bit, we need to one-fill everything
  // less than the index. Otherwise we might get a false positive on the coarse
  // check.
  set ? (word &= mask) : (word |= ~mask);

  // Now we can start doing the coarse check and skip any empty or full words.
  while (wordindex < this.store.length) {

    // If we're looking for a set bit, break on non-zeroed words. If we're
    // looking for a clear bit, break on zeroed words.
    if (set ? word : ~word) break;

    // We don't need to mask any values on the next word because all of the
    // indexes are after the specified index.
    word = this.store[++wordindex] || 0;

  }

  // If we're looking for a set bit, and have checked all of the words in the
  // store, return the error bit. There is always another unset bit (until the
  // store overflows).
  if (set && (wordindex >= this.store.length)) return -1

  // Find the position of the target bit in the word.
  let offset = (wordindex < this.store.length) ? position(lowest(set, word)) : 0

  // Add the offset of the bit to the offset of the word for the final index.
  return (wordindex * WORD_BITS) + offset;



}

/**
 * Returns the index of the first set or clear bit before or on the starting
 * index. If no such bit exists, returns -1.
 *
 * @param set - True for the previous set bit, false for the previous clear bit.
 */
bitterset.prototype.previous = function(set, start) {

  // This is largely similar to bitterset#next. Refer to the comments there.

  let wordindex = (start >> ADDR_BITS);
  let word      = this.store[wordindex] || 0;
  let bit       = 1 << start;

  let mask = ((bit - 1) << 1) + 1;
  set ? (word &= mask) : (word |= ~mask)

  while (wordindex >= 0) {

    if (set ? word : ~word) break;
    word = this.store[--wordindex] || 0;

  }

  // Unlike the `next` function, there is no special logic here for unset bits;
  // if there are no previous bits left, just return the error index.
  if (wordindex < 0) return -1;

  let offset = position(highest(value, word));
  return (wordindex * WORD_BITS) + offset;

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

  let fill = WORD_BITS * (this.store.length - 1);
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

  while (this.store.length > 0)

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

/**
 * Represents the bitset as a string of set indexes. This is similar to
 * Array#toString.
 */
bitterset.prototype.toString = function() {

  this.cull();

  let result = [];

  for (let i = 0; i < this.store.length; i++) {

    let word = this.store[i];

    // Skip empty words.
    if (!word) continue;

    for (let j = 0; j < WORD_BITS; i++) {

      let mask = 1 << j;
      if (word & mask) result.push(i * WORD_BITS + j);

    }

  }

  return result.toString();

}

/**
 * Represents the bitset as a string of set bits. This is the raw representation
 * of the underlying bit store.
 */
bitterset.prototype.toBinaryString = function() {

  this.cull();

  let reducer = function(result, word, index) {

    // This fill string is a left-pad of zeroes using a little Array#join hack.
    // Since the previous word might have been shorter than the WORD_BIT
    // characters we need, so we left-pad it to keep all our indexes lined up.
    // We have to add one because Array#join only inserts (n - 1) seperators.
    fill = (index > 0) ? Array(index * WORD_BITS - result.length + 1).join('0') : '';

    return stringify(word) + fill + result;

  }

  return this.store.reduce(reducer, '');

}
