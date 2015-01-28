bitterset
=========
[![Build Status](https://travis-ci.org/atonparker/bitterset.png?branch=master)](https://travis-ci.org/atonparker/bitterset)

__bitterset__ aims to be a a fast &amp; simple BitSet implementation consistent with the [Java BitSet class](http://docs.oracle.com/javase/7/docs/api/java/util/BitSet.html). The set will automatically grow and shrink to accomodate the largest significant bit.

Installation
------------

`npm install --save bitterset`

Methods
-------

#### new BitterSet()
Create a new bitset.

#### get(bit)
Get the boolean value of a bit.

#### set(bit)
Set a bit to true.

#### clear(bit)
Set a bit to false, or set all bits to false if no bit is specified.

#### flip(bit)
Flip the boolean value of a bit.

#### next(value, from)
Returns the index of the first bit that matches `value` after or on the specified `from` index. If no such bit exists, returns -1.

#### previous(value, from)
Returns the index of the first bit that matches `value` before or on the specified `from` index. If no such bit exists, returns -1.

#### length()
Returns the logical length of the bitset (the index of the highest bit, plus one).

#### cardinality()
Returns the cardinality of the bitset (the number of bits set to true).

#### cull()
Remove any unused words from the end of the bitset.

#### or(set)
Perform a logical OR against this bitset.

#### and(set)
Perform a logical AND against this bitset.

#### andnot(set)
Perform a logical AND against this bitset, with the complement of the given bitset.

#### xor(set)
Perform a logical XOR against this bitset.

#### toString()
Returns a string representation of this bitset, as a list of bit indexes that are set to true.

#### toBinaryString()
Returns a string representation of this bitset, as a string of significant bits.

Examples
--------

Getting, setting, and clearing values on the set:

    bs = new BitterSet
    
    # Set some individual bits.
    bs.set 0
    bs.set 17
    bs.set 46

    # Set a range of bits using a loop comprehension.
    bs.set bit for bit in [85..115]

    # Get the value of a bit.
    bs.get 0 # true
    bs.get 8 # false

    # Clear an individual bit.
    bs.clear 46

    # Clear all of the bits.
    do bs.clear

Looping over all of the significant values of the set:

    bs = new BitterSet
    ...
    bit = 0
    until bs.next(bit++, true) < 0
      do something

Combining multiple sets:

    a = new BitterSet
    a.set 0
    a.set 1

    b = new BitterSet
    b.set 1
    b.set 2

    c = new BitterSet
    c.set 2
    c.set 3

    a.or b     # a is now the set {0,1,2}
    a.and b    # a is now the set {1,2}
    a.xor c    # a is now the set {1,3}
    a.andnot c # a is now the set {1}

Testing
-------

__bitterset__ uses [Mocha](http://mochajs.org) for testing. To run the test suite, call `npm test` in the project directory.
