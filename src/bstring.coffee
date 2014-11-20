# Convert a word into an unsigned binary string. We need to do an empty unsigned right-shift to coerce the word into
# a uint32, or the toString function will misrepresent bit 31.
module.exports = (word) -> (word >>> 0).toString 2