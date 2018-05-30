# pull-high-watermark

a pull stream that eagerly reads ahead until it has reached the watermark.

# example

if there is medium/heavy sync processing in the pipe line (say, parsing),
it may go faster if we ensure there is always something coming in the async part,

We never want the io to be waiting for the parsing.

``` js
var pull = require('pull-stream')
var HighWatermark = require('pull-high-watermark')

pull(
  asyncSource,
  HighWatermark(10, 2), //go faster!
  heavySyncProcessing(),
  sink
)
```

## HighWatermark(hwm, lwm[, group]) => through

read ahead at most to the high water mark (`hwm`) and at least to the low water mark (`lwm`)
`hwm` default to 10, and `lwm` defaults to 0.

the `group` option indicates that the buffer should be emitted wholesale as an
array. this allows consumers to run batch operations on values, while avoiding
slowing down the upstream producer. defaults to `false`.

## License

MIT
