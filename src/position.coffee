# See [http://graphics.stanford.edu/~seander/bithacks.html#ZerosOnRightModLookup]

# A list of bit indexes for every product of a word modulo 37.
POSITION_TABLE = [ 32, 0, 1, 26, 2, 23, 27, 0, 3, 16, 24, 30, 28, 11, 0, 13, 4, 7, 17, 0, 25, 22, 31, 15, 29, 10, 12, 6, 0, 21, 14, 9, 5, 20, 8, 19, 18 ]

# Returns the index of a single bit in a 32-bit word. In other words, counts
# the trailing zeroes on the bit.
module.exports = (bit) -> POSITION_TABLE[ ((-bit & bit) >>> 0) % 37 ]