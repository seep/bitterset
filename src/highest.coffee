# Returns the highest set or unset bit in a word.
module.exports = (value, word) ->

  if not value then word = ~word

  word |= word >> 1
  word |= word >> 2
  word |= word >> 4
  word |= word >> 8
  word |= word >> 16

  # We have to use a zero-fill right shift here, or the word will overflow when
  # the highest bit is in the leftmost position.
  return (word >>> 1) + 1