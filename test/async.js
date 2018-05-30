var pull = require('pull-stream')
var HighWaterMark = require('../')
var Spec = require('pull-spec')

var tape = require('tape')

function source (i) {
    i = 3
    return function read (end, cb) {
        // console.log('read', ...arguments)
        if (end) return cb(end)
        setTimeout(() => {
            i = i - 1
            // console.log('i', i)
            if (i === 0) return cb(new Error('bork'))
            if (i < 0) return cb(true)
            cb(null, i)
        }, Math.random() * 30)
    }
}

function syncSource (i) {
    i = 3
    return function read (end, cb) {
        if (end) return cb(end)
        i = i - 1
        if (i === 0) return cb(new Error('bork'))
        if (i < 0) return cb(true)
        cb(null, i)
    }
}

// works, logs the error in the end
// pull(source(), pull.log())

// works when error is thrown sync
// pull(syncSource(), HighWaterMark(), pull.log())

// breaks, just stalls after the error

tape('async then error', function (t) {
  pull(Spec(source()), HighWaterMark(), pull.collect(function (err, ary) {
    t.ok(err)
    t.ok(ary.length <= 2)
    t.end()
  }))
})

tape('sync then error', function (t) {
  pull(Spec(syncSource()), HighWaterMark(), pull.collect(function (err, ary) {
    t.ok(err)
    t.deepEqual(ary, [])
    t.end()
  }))
})


tape('sync then end', function (t) {
  pull(
    Spec(pull.values([3,2,1])),
    HighWaterMark(),
    pull.collect(function (err, ary) {
      t.notOk(err)
      t.deepEqual(ary, [3,2,1])
      t.end()
    })
  )
})

tape('async then end', function (t) {
  pull(Spec(pull(
      pull.values([3,2,1]),
      pull.asyncMap(function (d, cb) {
        console.log("A", d)
        setTimeout(function () {
          cb(null, d)
        })
      })
    )),
    HighWaterMark(),
    pull.collect(function (err, ary) {
    t.notOk(err)
    t.deepEqual(ary, [3, 2,1])
    t.end()
  }))
})

tape('sync group then end', function (t) {
  pull(Spec(pull.values([3,2,1])),
    HighWaterMark(2, 1, true),
    pull.collect(function (err, ary) {
    t.notOk(err)
    t.deepEqual(ary, [[3,2], [1]])
    t.end()
  }))
})

tape('async group then end', function (t) {
  pull(Spec(pull(
      pull.values([3,2,1]),
      pull.asyncMap(function (d, cb) {
        setTimeout(function () {
          cb(null, d)
        })
      })
    )),
    HighWaterMark(2, 1, true),
    pull.collect(function (err, ary) {
    t.notOk(err)
    t.deepEqual(ary, [[3], [2], [1]])
    t.end()
  }))
})

tape('async group slow consume then end', function (t) {
  pull(Spec(pull(
      pull.values([3,2,1,0]),
      pull.asyncMap(function (d, cb) {
        setTimeout(function () {
          cb(null, d)
        })
      })
    )),
    HighWaterMark(2, 1, true),
    pull.asyncMap(function (d, cb) {
      setTimeout(function () {
        cb(null, d)
      }, 10)
    }),
    pull.collect(function (err, ary) {
    t.notOk(err)
    t.deepEqual(ary, [[3], [2, 1], [0]])
    t.end()
  }))
})

tape('segmented sync group slow consume then end', function (t) {
  pull(Spec(pull(
      pull.values([3,2,1,0]),
      pull.asyncMap(function (d, cb) {
        if (d === 1) {
          setTimeout(function () {
            cb(null, d)
          })
        } else {
          cb(null, d)
        }
      })
    )),
    HighWaterMark(2, 1, true),
    pull.asyncMap(function (d, cb) {
      setTimeout(function () {
        cb(null, d)
      }, 10)
    }),
    pull.collect(function (err, ary) {
    t.notOk(err)
    t.deepEqual(ary, [[3, 2], [1, 0]])
    t.end()
  }))
})
