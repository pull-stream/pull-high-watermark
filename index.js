
module.exports = function (hwm, lwm, group) {
  hwm = hwm || 10
  lwm = lwm || 0
  group = !!group
  var reading = false, ended = false, buffer = [], _cb = null
  return function (read) {
    function more () {
      if(reading || ended || buffer.length >= hwm) return
      reading = true
      read(null, function next (end, data) {
        if(end) ended = end
        else buffer.push(data)

        reading = false
        more()

        maybe(_cb)
      })
    }

    function maybe (cb) {
      //<delay> callback, if the buffer is smaller than <size>
      if(!cb) return
      if(!ended && buffer.length < lwm) {
          return _cb = cb
      }

      _cb = null
      if(ended && ended !== true) cb(ended)
      else if(buffer.length) {
        if(group) {
          var items = buffer
          buffer = []
          cb(null, items)
        } else cb(null, buffer.shift())
      } else if(ended) cb(ended)
      else _cb = cb
    }

    more()

    return function (abort, cb) {
      if(abort) read(abort, cb)
      else
        maybe(cb)

      more()
    }
  }
}










