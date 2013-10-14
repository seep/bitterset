BitterSet = require '../lib/bitterset'

describe 'a new bitset', ->
  bs = new BitterSet
  it 'should have a length of 0', ->
    bs.length().should.eql 0
  it 'should have a cardinality of 0', ->
    bs.cardinality().should.eql 0
  it 'should have 0 words', ->
    bs.store.should.be.empty
  it 'should look like "{}" as a string', ->
    bs.toString().should.eql '{}'
  it 'should look like "" as a binary string', ->
    bs.toBinaryString().should.eql ''

describe 'a bitset with bit 0 set', ->
  bs = new BitterSet
  bs.set 0
  it 'getting bit 0 should be true', ->
    bs.get(0).should.eql true
  it 'should have a length of 1', ->
    bs.length().should.eql 1
  it 'should have a cardinality of 1', ->
    bs.cardinality().should.eql 1
  it 'should have 1 word', ->
    bs.store.should.have.length 1
  it 'should look like "{0}" as a string', ->
    bs.toString().should.eql '{0}'
  it 'should look like "1" as a binary string', ->
    bs.toBinaryString().should.eql '1'

describe 'a bitset with bit 0 set and cleared', ->
  bs = new BitterSet
  bs.set 0
  bs.clear 0
  it 'getting bit 0 should be false', ->
    bs.get(0).should.eql false
  it 'should have a length of 0', ->
    bs.length().should.eql 0
  it 'should have a cardinality of 0', ->
    bs.cardinality().should.eql 0
  it 'should have 0 words', ->
    bs.store.should.be.empty
  it 'should look like "{}" as a string', ->
    bs.toString().should.eql '{}'
  it 'should look like "" as a binary string', ->
    bs.toBinaryString().should.eql ''

describe 'a bitset with bit 0 and bit 31 set', ->
  bs = new BitterSet
  bs.set 0
  bs.set 31
  it 'should have a length of 32', ->
    bs.length().should.eql 32
  it 'should have a cardinality of 2', ->
    bs.cardinality().should.eql 2
  it 'should have 1 words', ->
    bs.store.should.have.length 1
  it 'should look like "{0,31}" as a string', ->
    bs.toString().should.eql '{0,31}'
  it 'should look like "10000000000000000000000000000001" as a binary string', ->
    bs.toBinaryString().should.eql '10000000000000000000000000000001'

describe 'a bitset with bit 0 and bit 32 set', ->
  bs = new BitterSet
  bs.set 0
  bs.set 32
  it 'should have a length of 33', ->
    bs.length().should.eql 33
  it 'should have a cardinality of 2', ->
    bs.cardinality().should.eql 2
  it 'should have 2 words', ->
    bs.store.should.have.length 2
  it 'the next set bit from 0 should be 0', ->
    bs.next(true, 0).should.eql 0
  it 'the next set bit from 1 should be 32', ->
    bs.next(true, 1).should.eql 32
  it 'the next set bit from 33 should be the error bit (-1)', ->
    bs.next(true, 33).should.eql -1
  it 'the previous set bit from 0 should be 0', ->
    bs.previous(true, 0).should.eql 0
  it 'the previous set bit from 31 should be 0', ->
    bs.previous(true, 31).should.eql 0
  it 'the previous clear bit from 0 should be the error bit (-1)', ->
    bs.previous(false, 0).should.eql -1
  it 'the previous clear bit from 1 should be 1', ->
    bs.previous(false, 1).should.eql 1
  it 'the previous clear bit from 32 should be 31', ->
    bs.previous(false, 32).should.eql 31
  it 'should look like "{0,32}" as a string', ->
    bs.toString().should.eql '{0,32}'
  it 'should look like "100000000000000000000000000000001" as a binary string', ->
    bs.toBinaryString().should.eql '100000000000000000000000000000001'

describe 'a bitset with bit 0 and bit 32 set, and bit 32 cleared', ->
  bs = new BitterSet
  bs.set 0
  bs.set 32
  bs.clear 32
  it 'should have a length of 1', ->
    bs.length().should.eql 1
  it 'should have a cardinality of 1', ->
    bs.cardinality().should.eql 1
  it 'should have 1 word', ->
    bs.store.should.have.length 1
  it 'should look like "{0}" as a string', ->
    bs.toString().should.eql '{0}'
  it 'should look like "1" as a binary string', ->
    bs.toBinaryString().should.eql '1'

describe 'a bitset with bit 0 and bit 32 set, and all bits cleared', ->
  bs = new BitterSet
  bs.set 0
  bs.set 32
  do bs.clear
  it 'should have a length of 0', ->
    bs.length().should.eql 0
  it 'should have a cardinality of 0', ->
    bs.cardinality().should.eql 0
  it 'should have 0 words', ->
    bs.store.should.be.empty
  it 'should look like "{}" as a string', ->
    bs.toString().should.eql '{}'
  it 'should look like "" as a binary string', ->
    bs.toBinaryString().should.eql ''

describe 'a bitset with bit 0 flipped', ->
  bs = new BitterSet
  bs.flip 0
  it 'should have a length of 1', ->
    bs.length().should.eql 1
  it 'should have a cardinality of 1', ->
    bs.cardinality().should.eql 1
  it 'should have 1 word', ->
    bs.store.should.have.length 1
  it 'should look like "{0}" as a string', ->
    bs.toString().should.eql '{0}'
  it 'should look like "1" as a binary string', ->
    bs.toBinaryString().should.eql '1'

describe 'a bitset with bit 0 flipped twice', ->
  bs = new BitterSet
  bs.flip 0
  bs.flip 0
  it 'should have a length of 0', ->
    bs.length().should.eql 0
  it 'should have a cardinality of 0', ->
    bs.cardinality().should.eql 0
  it 'should have 0 words', ->
    bs.store.should.be.empty
  it 'should look like "{}" as a string', ->
    bs.toString().should.eql '{}'
  it 'should look like "" as a binary string', ->
    bs.toBinaryString().should.eql ''
