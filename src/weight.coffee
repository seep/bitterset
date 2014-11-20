# A list of cardinalities for every nibble combination.
HAMMING_TABLE = [
  0, # 0b0000
  1, # 0b0001
  1, # 0b0010
  2, # 0b0011
  1, # 0b0100
  2, # 0b0101
  2, # 0b0110
  3, # 0b0111
  1, # 0b1000
  2, # 0b1001
  2, # 0b1010
  3, # 0b1011
  2, # 0b1100
  3, # 0b1101
  3, # 0b1110
  4  # 0b1111
]

# Find the Hamming Weight of a word.
module.exports = (word) ->
  HAMMING_TABLE[ (word >> 0x00) & 0xF ] +
  HAMMING_TABLE[ (word >> 0x04) & 0xF ] +
  HAMMING_TABLE[ (word >> 0x08) & 0xF ] +
  HAMMING_TABLE[ (word >> 0x0C) & 0xF ] +
  HAMMING_TABLE[ (word >> 0x10) & 0xF ] +
  HAMMING_TABLE[ (word >> 0x14) & 0xF ] +
  HAMMING_TABLE[ (word >> 0x18) & 0xF ] +
  HAMMING_TABLE[ (word >> 0x1C) & 0xF ]