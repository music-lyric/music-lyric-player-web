# @music-lyric-player/base

Owns playback time, active-line tracking, and event emission. Pure logic with **zero DOM dependencies** — pair it with [`@music-lyric-player/dom`](https://github.com/music-lyric/music-lyric-player-web/tree/main/packages/dom) for the default renderer, or plug in your own.

## Install

```shell
npm install @music-lyric-player/base music-lyric-kit
```

## Events

| Event         | Payload                                      | Fires when                 |
| ------------- | -------------------------------------------- | -------------------------- |
| `play`        | `(currentTime: number)`                      | Playback starts or resumes |
| `pause`       | `(currentTime: number)`                      | Playback pauses            |
| `lyricUpdate` | `(info: Info)`                               | A new lyric is loaded      |
| `linesUpdate` | `(lines, indexes, firstActiveIndex, isSeek)` | Active lines change        |

## Usage

```js
import { BaseLyricPlayer } from '@music-lyric-player/base'
import { ParserPipeline } from 'music-lyric-kit'

const base = new BaseLyricPlayer()

base.event.add('play', (time) => {})
base.event.add('pause', (time) => {})
base.event.add('lyricUpdate', (info) => {})
base.event.add('linesUpdate', (lines, indexes, firstActiveIndex, isSeek) => {})

const { result } = new ParserPipeline({
  content: { original: '[00:01.114]Hello world' },
  format: 'lrc',
})
  .parse()
  .pureClean()
  .interludeInsert()
  .spaceInsert()
  .final()

base.updateLyric(result)
base.play(0)
```

## Options

| Field                           | Type                     | Default       | Description                                                                                     |
| ------------------------------- | ------------------------ | ------------- | ---------------------------------------------------------------------------------------------- |
| `driver`                        | `'animation' \| 'timer'` | `'animation'` | Tick source. `animation` uses `requestAnimationFrame`; `timer` uses `setTimeout(16)`           |
| `bridgeActive`                  | `boolean`                | `true`        | Promote lines sandwiched between active lines back to active so the block reads as continuous   |
| `mergeWindow`                   | `number`                 | `300`         | Merge deactivation of consecutive lines whose end times fall within this many ms (`0` disables) |
| `mergeLimit`                    | `number`                 | `3`           | Max lines per merge batch; longer runs force-flush every `mergeLimit` lines (`0` unbounded)     |
| `offset.global`                 | `number`                 | `0`           | Global time offset in ms applied to every lyric                                                 |
| `offset.useMeta`                | `boolean`                | `true`        | Apply the offset carried by the lyric's own meta (`MetaType.Offset`)                            |
| `offset.resetTempOnLyricChange` | `boolean`                | `true`        | Reset the temp offset (set via `updateTempOffset`) to `0` when a new lyric loads                |

```js
base.config.update({ driver: 'animation' })
```
