bitterset
=========
[![Build Status](https://travis-ci.org/atonparker/bitterset.png?branch=master)](https://travis-ci.org/atonparker/bitterset)

__bitterset__ aims to be a a fast &amp; simple set of bits. The set will automatically grow and shrink to accomodate the largest significant bit. It has no dependencies.

`npm install --save bitterset`

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
bs.set(46, false);

// Clear all of the bits.
bs.clear();
```

Iterating over the set:

```javascript
let bs = bitterset();

bs.set(0);
bs.set(5);
bs.set(9);

let iter = bs.forwards(true);

iter.next().value == 0;
iter.next().value == 5;
iter.next().value == 9;

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

API
-------

#### `bitterset()`
Create a new bitset.

#### `bitterset#get(index)`
Get the value of a bit.

#### `bitterset#set(index)`
Set a bit to true.

#### `bitterset#clear(index)`
Set one or all of the bits to false.

#### `bitterset#flip(index)`
Flip the value of a bit.

#### `bitterset#forwards(value, start = 0)`
Returns a forward iterator over the bitset that will yield the next set or unset bit. If you're iterating over set bits, when the iterator is done it will return -1. If you're iterating over unset bits, the iterator will continue indefinitely.

#### `bitterset#backwards(value, start = length)`
Returns a backwards iterator over the bitset that will yield the next set or unset bit. When you reach the beginning of the set, the iterator will return -1.

#### `bitterset#length()`
Returns the length of the bitset (the index of the highest set bit, plus one).

#### `bitterset#cardinality()`
Returns the cardinality of the bitset (the number of set bits).

#### `bitterset#cull()`
Remove any unused words from the end of the bitset.

#### `bitterset#or(that)`
Perform a logical OR against this bitset.

#### `bitterset#and(that)`
Perform a logical AND against this bitset.

#### `bitterset#andnot(that)`
Perform a logical AND against this bitset, with the complement of the given bitset.

#### `bitterset#xor(that)`
Perform a logical XOR against this bitset.

Testing
-------

__bitterset__ uses [tape](https://github.com/substack/tape) for testing. Simply run `npm test` in the project directory.
