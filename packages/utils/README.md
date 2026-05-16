# @music-lyric-player/utils

> Shared utilities for the `music-lyric-player` family.

Internal helpers consumed by [`@music-lyric-player/base`](https://github.com/music-lyric/music-lyric-player-web/tree/main/packages/base) and [`@music-lyric-player/dom`](https://github.com/music-lyric/music-lyric-player-web/tree/main/packages/dom). You usually do not need to install this directly — it is pulled in transitively.

Part of [music-lyric-player-web](https://github.com/music-lyric/music-lyric-player-web).

## Install

```shell
npm install @music-lyric-player/utils
```

## What's inside

| Export                                          | Purpose                                                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `ConfigManager`                                 | Reactive, deeply-mergeable typed config with an `update` event that emits the set of changed key paths |
| `Event`                                         | Typed event emitter with `add` / `remove` / `emit` / `clear`                                           |
| `deepCompare`, `freezeDeep`, `hasKeyContaining` | Object helpers used by the renderer for change-detection and read-only state                           |
| `random`, `regex`                               | Small pure helpers                                                                                     |
| `DeepPartial`, `DeepRequired`, `NestedKeys`     | Type helpers used by config types                                                                      |

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
