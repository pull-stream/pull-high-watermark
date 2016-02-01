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
  HighWatermark(10), //go faster!
  heavySyncProcessing(),
  sink
)

```

## License

MIT
