# @music-lyric-player/base

> Headless timing and state engine for `music-lyric-player`.

Owns playback time, active-line tracking, and event emission. Pure logic with **zero DOM dependencies** — pair it with [`@music-lyric-player/dom`](https://github.com/music-lyric/music-lyric-player-web/tree/main/packages/dom) for the default renderer, or plug in your own.

Part of [music-lyric-player-web](https://github.com/music-lyric/music-lyric-player-web).

## Install

```shell
npm install @music-lyric-player/base music-lyric-kit
```

## Events

| Event         | Payload                                | Fires when                 |
| ------------- | -------------------------------------- | -------------------------- |
| `play`        | `(currentTime: number)`                | Playback starts or resumes |
| `pause`       | `(currentTime: number)`                | Playback pauses            |
| `lyricUpdate` | `(info: Info)`                         | A new lyric is loaded      |
| `linesUpdate` | `(lines, indexes, firstIndex, isSeek)` | Active lines change        |

## Usage

```js
import { BaseLyricPlayer } from '@music-lyric-player/base'
import { ParserPipeline } from 'music-lyric-kit'

const base = new BaseLyricPlayer()

base.event.add('play', (time) => {})
base.event.add('pause', (time) => {})
base.event.add('lyricUpdate', (info) => {})
base.event.add('linesUpdate', (lines, indexes, firstIndex, isSeek) => {})

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

| Field    | Type                     | Default   | Description                                                                          |
| -------- | ------------------------ | --------- | ------------------------------------------------------------------------------------ |
| `driver` | `'animation' \| 'timer'` | `'timer'` | Tick source. `animation` uses `requestAnimationFrame`; `timer` uses `setTimeout(16)` |

```js
base.config.update({ driver: 'animation' })
```
