bstring  = require './bstring'
highest  = require './highest'
lowest   = require './lowest'
position = require './position'
weight   = require './weight'

WORD_BITS  = 32
ADDR_BITS  = 5

# Search a word for true bits and return an array of bit indexes.
bits = (word, offset = 0) ->
  (bit + offset * WORD_BITS) for bit in [0..WORD_BITS - 1] when (word & (1 << bit)) isnt 0x0

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
      @store = []
    return

  # Flip the boolean value of a bit.
  flip: (bit) ->
    @store[bit >> ADDR_BITS] ^= (1 << bit)
    return

  # Returns the index of the first bit that matches `value` after or on the
  # specified `from` index. If no such bit exists, returns -1.
  next: (value, from) ->

    index = (from >> ADDR_BITS)
    word  = @store[index] or 0
    bit   = 1 << from

    # The mask is the bit with no leading zeroes.
    # bit  == 0b00010000
    # mask == 0b11110000
    mask = ~(bit - 1)

    # If we are looking for true values, we need to zero-fill everything less
    # than the index. If we are looking for false values, we need to one-fill
    # everything less than the index.
    if value then (word &= mask) else (word |= ~mask)

    # Now we can start doing the coarse check and skip any empty or full words.
    until index >= @store.length or ((value and word) or (not value and ~word))
      # We don't need to mask any values on the next word because all of the
      # indexes are after the specified index.
      index++
      word = @store[index] or 0

    # If we're looking for a set bit, and have checked all of the words in the
    # store, return the error bit. There is always another unset bit (until the
    # store overflows).
    return -1 if value and index >= @store.length

    offset = if (index < @store.length) then (position lowest value, word) else 0

    return (index * WORD_BITS) + offset

  # Returns the index of the first bit that matches `value` before or on the specified `from` index. If no such bit
  # exists, returns -1.
  previous: (value, from) ->

    index = (from >> ADDR_BITS)
    word  = @store[index] or 0
    bit   = 1 << from

    # The mask is the bit with no trailing zeroes.
    # bit  == 0b00010000
    # mask == 0b00011111
    mask = ((bit - 1) << 1) + 1

    if value then (word &= mask) else (word |= ~mask)

    # Now we can start doing the coarse check and skip any empty or full words.
    until index < 0 or ((value and word) or (not value and ~word))
      index--
      word = @store[index] or 0

    # Unlike the `next` function, there is no special logic here for unset bits;
    # if there are no previous bits left, just return the error index.
    return -1 if index < 0

    offset = position highest value, word

    return (index * WORD_BITS) + offset

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
      if not tail then @store.pop() else break
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