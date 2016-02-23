'use strict';

// A list of bit indexes for every product of a word modulo 37.
// See http://graphics.stanford.edu/~seander/bithacks.html#ZerosOnRightModLookup
const POSITION_TABLE = [ 32, 0, 1, 26, 2, 23, 27, 0, 3, 16, 24, 30, 28, 11, 0, 13, 4, 7, 17, 0, 25, 22, 31, 15, 29, 10, 12, 6, 0, 21, 14, 9, 5, 20, 8, 19, 18 ];

/**
 * Returns the index of the lowest set bit in a 32-bit word. In other words,
 * counts the trailing zeroes on the word.
 */
function position(word) {

  return POSITION_TABLE[ ((-word & word) >>> 0) % 37 ];

}

// A list of cardinalities for every nibble. We could do this for every byte
// if we wanted, but the table would be much larger.
const HAMMING_TABLE = [
  0, // 0b0000
  1, // 0b0001
  1, // 0b0010
  2, // 0b0011
  1, // 0b0100
  2, // 0b0101
  2, // 0b0110
  3, // 0b0111
  1, // 0b1000
  2, // 0b1001
  2, // 0b1010
  3, // 0b1011
  2, // 0b1100
  3, // 0b1101
  3, // 0b1110
  4  // 0b1111
];

/**
 * Compute the Hamming Weight of a word.
 */
function weight(word) {

  return HAMMING_TABLE[ (word >> 0x00) & 0xF ] +
         HAMMING_TABLE[ (word >> 0x04) & 0xF ] +
         HAMMING_TABLE[ (word >> 0x08) & 0xF ] +
         HAMMING_TABLE[ (word >> 0x0C) & 0xF ] +
         HAMMING_TABLE[ (word >> 0x10) & 0xF ] +
         HAMMING_TABLE[ (word >> 0x14) & 0xF ] +
         HAMMING_TABLE[ (word >> 0x18) & 0xF ] +
         HAMMING_TABLE[ (word >> 0x1C) & 0xF ];

}

/**
 * Returns the lowest set or unset bit in a word.
 * @param set - True for the lowest set bit, false for the lowest clear bit.
 */
function lowest(set, word) {

  return set ? (word & -word) : (~word & (word + 1));

}

/**
 * Returns the highest set or unset bit in a word.
 * @param set - True for the highest set bit, false for the highest clear bit.
 */
function highest(set, word) {

  if (!set) word = ~word;

  word |= word >> 1;
  word |= word >> 2;
  word |= word >> 4;
  word |= word >> 8;
  word |= word >> 16;

  // We have to use a zero-fill right shift here, or the word will overflow when
  // the highest bit is in the leftmost position.
  return (word >>> 1) + 1;

}

/**
 * Convert a word into an unsigned binary string. We need to do an empty
 * unsigned right-shift to coerce the word into a uint32, or the toString
 * function will misrepresent bit 31.
 */
function stringify(word) {

  return (word >>> 0).toString(2);

}

module.exports = {

  position:  position,
  weight:    weight,
  lowest:    lowest,
  highest:   highest,
  stringify: stringify

}
