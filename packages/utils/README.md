# @music-lyric-player/utils

Internal helpers consumed by [`@music-lyric-player/base`](https://github.com/music-lyric/music-lyric-player-web/tree/main/packages/base) and [`@music-lyric-player/dom`](https://github.com/music-lyric/music-lyric-player-web/tree/main/packages/dom). You usually do not need to install this directly — it is pulled in transitively.

## Install

```shell
npm install @music-lyric-player/utils
```

## Example

```js
import { ConfigManager, Event } from '@music-lyric-player/utils'

const config = new ConfigManager({ foo: 1, bar: { baz: 2 } }, {})
config.event.add('update', (changedKeys) => {
  // changedKeys is a Set of changed key paths, e.g. Set { 'bar.baz' }
})
config.update({ bar: { baz: 3 } })

const event = new Event()
event.add('hello', (name) => console.log(`hi ${name}`))
event.emit('hello', 'world')
```
