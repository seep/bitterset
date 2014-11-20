BitterSet = require '../src/bitterset'

{log, time, timeEnd} = console

bs = new BitterSet
bs.set (2 << 24) - 1

time 'sparse next'
log bs.next true, 0
timeEnd 'sparse next'

bs = new BitterSet
bs.set 0

time 'sparse prev'
log bs.previous true, (2 << 24) - 1
timeEnd 'sparse prev'

bs = new BitterSet
bs.set i for i in [0..(2 << 24) - 1]

time 'dense next'
log bs.next false, 0
timeEnd 'dense next'

bs = new BitterSet
bs.set i for i in [1..(2 << 24) - 1]

time 'dense prev'
log bs.previous false, (2 << 24) - 1
timeEnd 'dense prev'

process.exit()