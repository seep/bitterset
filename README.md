BitterSet
=========

__BitterSet__ aims to be a a fast &amp; simple BitSet implementation consistent with the [Java BitSet class](http://docs.oracle.com/javase/7/docs/api/java/util/BitSet.html). The set will automatically grow and shrink to accomodate the largest significant bit.

Methods
=======

<dl>

  <dt>get(bit)</dt>
  <dd>Get the boolean value of a bit.</dd>

  <dt>set(bit)</dt>
  <dd>Set a bit to true.</dd>

  <dt>clear(bit)</dt>
  <dd>Set a bit to false, or set all bits to false if no bit is specified.</dd>

  <dt>flip(bit)</dt>
  <dd>Flip the boolean value of a bit.</dd>

  <dt>next(value, from)</dt>
  <dd>Returns the index of the first bit that matches `value` after or on the specified `from` index. If no such bit exists, returns -1.</dd>

  <dt>previous(value, from)</dt>
  <dd>Returns the index of the first bit that matches `value` before or on the specified `from` index. If no such bit exists, returns -1.</dd>

  <dt>length()</dt>
  <dd>Returns the logical length of the bitset (the index of the highest bit, plus one).</dd>

  <dt>cardinality()</dt>
  <dd>Returns the cardinality of the bitset (the number of bits set to true).</dd>

  <dt>cull()</dt>
  <dd>Remove any unused words from the end of the bitset.</dd>

  <dt>or(set)</dt>
  <dd>Perform a logical OR against this bitset.</dd>

  <dt>and(set)</dt>
  <dd>Perform a logical AND against this bitset.</dd>

  <dt>andnot(set)</dt>
  <dd>Perform a logical AND against this bitset, with the complement of the given bitset.</dd>

  <dt>xor(set)</dt>
  <dd>Perform a logical XOR against this bitset.</dd>

  <dt>toString()</dt>
  <dd>Returns a string representation of this bitset, as a list of bit indexes that are set to true.</dd>

  <dt>toBinaryString()</dt>
  <dd>Returns a string representation of this bitset, as a string of significant bits.</dd>

</dl>

Examples
========

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
=======

BitterSet uses [Mocha](http://visionmedia.github.io/mocha/) for testing. To run the test suite, call `npm test` in the project directory.

License
=======

The MIT License (MIT)

Copyright (c) 2013 Chris Parker

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
