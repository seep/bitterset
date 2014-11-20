# Returns the lowest set or unset bit in a word.
module.exports = (value, word) ->
  if value then return word & -word
  else          return ~word & (word + 1)