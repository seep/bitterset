BitterSet = require '../lib/bitterset'

describe '{} OR {0}', ->
  a = new BitterSet
  b = new BitterSet
  b.set 0
  a.or b
  it 'should equal {0}', ->
    a.toString().should.eql '{0}'

describe '{} AND {0}', ->
  a = new BitterSet
  b = new BitterSet
  b.set 0
  a.and b
  it 'should equal {}', ->
    a.toString().should.eql '{}'

describe '{} ANDNOT {0}', ->
  a = new BitterSet
  b = new BitterSet
  b.set 0
  a.andnot b
  it 'should equal {}', ->
    a.toString().should.eql '{}'

describe '{} XOR {0}', ->
  a = new BitterSet
  b = new BitterSet
  b.set 0
  a.xor b
  it 'should equal {0}', ->
    a.toString().should.eql '{0}'

describe '{0} OR {0}', ->
  a = new BitterSet
  a.set 0
  b = new BitterSet
  b.set 0
  a.or b
  it 'should equal {0}', ->
    a.toString().should.eql '{0}'

describe '{0} AND {0}', ->
  a = new BitterSet
  a.set 0
  b = new BitterSet
  b.set 0
  a.and b
  it 'should equal {0}', ->
    a.toString().should.eql '{0}'

describe '{0} ANDNOT {0}', ->
  a = new BitterSet
  a.set 0
  b = new BitterSet
  b.set 0
  a.andnot b
  it 'should equal {}', ->
    a.toString().should.eql '{}'

describe '{0} XOR {0}', ->
  a = new BitterSet
  a.set 0
  b = new BitterSet
  b.set 0
  a.xor b
  it 'should equal {}', ->
    a.toString().should.eql '{}'

describe 'when A is {0}, A OR A', ->
  a = new BitterSet
  a.set 0
  a.or a
  it 'should equal {0}', ->
    a.toString().should.eql '{0}'

describe 'when A is {0}, A AND A', ->
  a = new BitterSet
  a.set 0
  a.and a
  it 'should equal {0}', ->
    a.toString().should.eql '{0}'

describe 'when A is {0}, A ANDNOT A', ->
  a = new BitterSet
  a.set 0
  a.andnot a
  it 'should equal {}', ->
    a.toString().should.eql '{}'

describe 'when A is {0}, A XOR A', ->
  a = new BitterSet
  a.set 0
  a.xor a
  it 'should equal {}', ->
    a.toString().should.eql '{}'