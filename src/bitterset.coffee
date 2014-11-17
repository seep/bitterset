WORD_BITS = 32
ADDR_BITS = 5

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

# Find the hamming weight of a word in the bitset.
weight = (word) ->
  HAMMING_TABLE[ (word >> 0x00) & 0xF ] +
  HAMMING_TABLE[ (word >> 0x04) & 0xF ] +
  HAMMING_TABLE[ (word >> 0x08) & 0xF ] +
  HAMMING_TABLE[ (word >> 0x0C) & 0xF ] +
  HAMMING_TABLE[ (word >> 0x10) & 0xF ] +
  HAMMING_TABLE[ (word >> 0x14) & 0xF ] +
  HAMMING_TABLE[ (word >> 0x18) & 0xF ] +
  HAMMING_TABLE[ (word >> 0x1C) & 0xF ]

# Search a word for true bits and return an array of bit indexes.
bits = (word, offset = 0) ->
  (bit + offset * WORD_BITS) for bit in [0..WORD_BITS - 1] when (word & (1 << bit)) isnt 0x0

# Convert a word into an unsigned binary string. We need to do an empty unsigned right-shift to coerce the word into
# a uint32, or the toString function will misrepresent bit 31.
bstring = (word) -> (word >>> 0).toString(2)

module.exports = class BitterSet

  constructor: ->
    @store = []

  # Get the boolean value of a bit.
  get: (bit) ->
    return (@store[bit >> ADDR_BITS] & (1 << bit)) isnt 0x0

  # Set a bit to true.
  set: (bit) ->
    # In JavaScript, the bitwise left shift only uses the low 5 bits. In other words, it automatically modulates by 32.
    @store[bit >> ADDR_BITS] |= (1 << bit)
    return

  # Set a bit to false, or set all bits to false if no bit is specified.
  clear: (bit) ->
    if bit?
      @store[bit >> ADDR_BITS] &= ~(1 << bit)
    else
      @store = [ ]
    return

  # Flip the boolean value of a bit.
  flip: (bit) ->
    @store[bit >> ADDR_BITS] ^= (1 << bit)
    return

  # Returns the index of the first bit that matches `value` after or on the specified `from` index. If no such bit
  # exists, returns -1.
  next: (value, from) ->
    length = do @length
    while from < length
      return from if @get(from) is value
      from += 1
    # If we are looking for the next false value, and we've run out of set bits, then we can just return the current
    # index (because an unset bit is inherintly false). Otherwise, we need to return the error index (-1) to indicate
    # that there is no set bit after the given index.
    if value is false then return from else return -1

  # Returns the index of the first bit that matches `value` before or on the specified `from` index. If no such bit
  # exists, returns -1.
  previous: (value, from) ->
    until from < 0
      return from if @get(from) is value
      from -= 1
    # Unlike the `next` function, there is no special logic here; if there are no previous bits left, just return the
    # error index.
    return -1

  # Returns the logical length of the bitset (the index of the highest bit, plus one).
  length: ->
    # We need to cull the word store so that the last word in the store is a significant one.
    do @cull
    return 0 if @store.length is 0
    fill = WORD_BITS * (@store.length - 1)
    tail = bstring(@store[@store.length - 1]).length
    return fill + tail

  # Returns the cardinality of the bitset (the number of bits set to true).
  cardinality: ->
    reducer = (sum, word) -> sum + weight(word)
    return @store.reduce reducer, 0

  # Remove any unused words from the end of the bitset.
  cull: ->
    while @store.length > 0
      tail = @store[@store.length - 1]
      if not tail? or tail is 0x0 then @store.pop() else break
    return

  # Perform a logical OR against this bitset.
  or: (set) ->
    # The logical OR is idempotent.
    return if set is @
    # Since OR is an additive operation, we only need to operate on the words defined by the other set. If the other
    # set has more words than this set, the OR-equals will silently operate using 0 for the LHS and add the new word
    # to the store. If the other set has less words than this set, we don't need to operate on our extra words
    # (because we would be ORing against 0, which does nothing).
    @store[i] |= set.store[i] for i in [0..set.store.length - 1]
    return

  # Perform a logical AND against this bitset.
  and: (set) ->
    # The logical AND is idempotent.
    return if set is @
    # Compared to the OR operation, the AND operation requires an extra condition. This time, we operate on the words
    # defined by our own set. If the other set has more words than this set, the AND operation would result in 0, so
    # we avoid adding empty words to our store. If the other set has less words than this set, we need to explicitly
    # operate using 0 for the RHS. Because there is a possibility that we end up with empty words, we end the function
    # with a cull.
    @store[i] &= (set.store[i] or 0) for i in [0..@store.length - 1]
    do @cull
    return

  # Perform a logical AND against this bitset, with the complement of the given bitset.
  andnot: (set) ->
    if set is @
      # The logical AND of a set's own compliment is the empty set.
      do @clear
    else
      @store[i] &= ~(set.store[i] or 0) for i in [0..@store.length - 1]
      do @cull
    return

  # Perform a logical XOR against this bitset.
  xor: (set) ->
    if set is @
      # The logical XOR of a set against itself is the empty set.
      do @clear
    else
      # Like OR, the XOR operation is additive and we only need to operate on the words defined by the other set.
      @store[i] ^= set.store[i] for i in [0..set.store.length]
      do @cull
    return

  # Returns a string representation of this bitset, as a list of bit indexes that are set to true.
  toString: ->
    do @cull
    return "\{#{ bits(word, index) for word, index in @store when word? and word isnt 0 }\}"

  # Returns a string representation of this bitset, as a string of significant bits.
  toBinaryString: ->
    do @cull
    # When used with Array#reduce, this function takes each word in the store, converts it into a binary string, and
    # reduces it to a big-endian binary string.
    reducer = (string, word, index) ->
      # This fill string is a left-pad of zeroes using a little Array#join hack. Since the previous word might have
      # been shorter than the WORD_BIT characters we need, so we left-pad it to keep all our indexes lined up. We
      # have to add one because Array#join only inserts (n - 1) seperators.
      fill = if index > 0 then Array(index * WORD_BITS - string.length + 1).join('0') else ''
      return bstring(word) + fill + string
    # The Array#reduce function requires a default value when operating on an empty array, so we put it in there just
    # in case.
    return @store.reduce reducer, ''