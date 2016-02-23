bitterset
=========
[![Build Status](https://travis-ci.org/atonparker/bitterset.png?branch=master)](https://travis-ci.org/atonparker/bitterset)

__bitterset__ aims to be a a fast &amp; simple set of bits. The set will automatically grow and shrink to accomodate the largest significant bit. It has no dependencies.

`npm install --save bitterset`

Methods
-------

#### bitterset()
Create a new bitset.

#### bitterset#get(index)
Get the boolean value of a bit.

#### bitterset#set(index)
Set a bit to true.

#### bitterset#clear(index)
Set a bit to false, or set all bits to false if no bit is specified.

#### bitterset#flip(index)
Flip the boolean value of a bit.

#### bitterset#next(set, start)
Returns the index of the first set or clear bit after or on the starting index. If no such bit exists, returns -1.

#### bitterset#previous(set, start)
Returns the index of the first set or clear bit before or on the starting index. If no such bit exists, returns -1.

#### bitterset#length()
Returns the logical length of the bitset (the index of the highest bit, plus one).

#### bitterset#cardinality()
Returns the cardinality of the bitset (the number of set bits).

#### bitterset#cull()
Remove any unused words from the end of the bitset.

#### bitterset#or(that)
Perform a logical OR against this bitset.

#### bitterset#and(that)
Perform a logical AND against this bitset.

#### bitterset#andnot(that)
Perform a logical AND against this bitset, with the complement of the given bitset.

#### bitterset#xor(that)
Perform a logical XOR against this bitset.

#### bitterset#indexes()
Get an array of the indexes of set bits. This is pretty expensive so don't do it often.

Examples
--------

Getting, setting, and clearing values on the set:

```javascript
let bs = bitterset();

// Set some individual bits.
bs.set(0);
bs.set(17);
bs.set(46);

// Get the value of a bit.
bs.get(0); // true
bs.get(8); // false

// Clear an individual bit.
bs.clear(46);

// Clear all of the bits.
bs.clear();
```

Getting the next set bit on the set:

```javascript
let bs = bitterset();

bs.set(0);
bs.set(5);
bs.set(9);

bs.next(true);   // 0
bs.next(true, 1) // 5

// Iterate over the set bits.
for (let i = 0; i >= 0; i = bs.next(true, i)) { ... }
```

Combining multiple sets:

```javascript
let a = bitterset();
a.set(0);
a.set(1);

let b = bitterset();
b.set(1);
b.set(2);

let c = bitterset();
c.set(2);
c.set(3);

a.or(b);     // a is now {0,1,2}
a.and(b);    // a is now {1,2}
a.xor(c);    // a is now {1,3}
a.andnot(c); // a is now {1}

```

Testing
-------

__bitterset__ uses [Tape](https://github.com/substack/tape) for testing. Simply run `npm test` in the project directory.
