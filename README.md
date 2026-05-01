<p align="center">
  <img
    src="https://socialify.git.ci/music-lyric/music-lyric-player-web/image?custom_description=Music+Lyric+Player&description=1&font=Inter&forks=1&issues=1&language=1&name=1&owner=1&pattern=Plus&pulls=1&stargazers=1&theme=Auto"
  />
</p>

<p align="center">An animation-rich, highly customizable web lyric player</p>

<p align="center">
  <a href="https://www.npmjs.com/package/music-lyric-player">
    <img src="https://img.shields.io/npm/v/music-lyric-player?color=a1b858&label=npm" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/music-lyric-player">
    <img src="https://img.shields.io/npm/dm/music-lyric-player?color=50a36f&label=downloads" alt="npm downloads" />
  </a>
  <a href="https://github.com/music-lyric/music-lyric-player-web/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/music-lyric/music-lyric-player-web" alt="license" />
  </a>
</p>

<p align="center">
  English | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a>
</p>

> [!WARNING]
>
> This project is currently under development, and some interfaces are not yet stable.

## Features

- **Built-in animations**: per-syllable float and karaoke wipe, distance-based blur and scale, container edge fade. Every effect is independently toggleable and tunable
- **Four scroll modes**: smooth, ripple, directional, stagger. A single field changes the entire scroll feel
- **Lyric-aware rendering**: syllable-level highlighting, translation and romanization sub-lines, interlude markers, and per-state styling for normal / active / played
- **Configure everything, live**: every visual concern (container / layout / effect / scroll / line) is its own deeply optional slice. Override what matters and update mid-playback without remount or flicker
- **Pluggable, GPU-friendly**: timing and state live in `base` with zero DOM dependency; rendering uses CSS transforms and filters in `dom`. Plug in your own renderer if needed

## Install

```shell
npm install music-lyric-player music-lyric-kit
```

> [!IMPORTANT]
>
> Lyric data is parsed by [`music-lyric-kit`](https://github.com/music-lyric/music-lyric-kit-node), which needs to be installed alongside the player.

## Usage

The player is composed of two layers: `BaseLyricPlayer` owns timing and lyric state, while `DomLyricPlayer` renders the result to the DOM. The two are typically used together.

### Base player

If you're building a custom renderer, depend on `@music-lyric-player/base` directly. It contains pure timing and state logic, with no DOM dependency.

```js
import { BaseLyricPlayer } from '@music-lyric-player/base'

const base = new BaseLyricPlayer()

const callback = () => {}

// Play event
base.event.add('play', callback)
// Pause event
base.event.add('pause', callback)
// Lyric update event
base.event.add('lyricUpdate', callback)
// Lines update event
base.event.add('linesUpdate', callback)

// Update lyric
// Pass in the parsed result from music-lyric-kit
base.updateLyric(result)

// Play
base.play(0)
```

### DOM player

```js
import { BaseLyricPlayer } from '@music-lyric-player/base'
import { DomLyricPlayer } from '@music-lyric-player/dom'
import { ParserPipeline } from 'music-lyric-kit'

// Create
const base = new BaseLyricPlayer()
const dom = new DomLyricPlayer(base)

// Mount
const container = window.document.getElementById('lyric-container')
container.appendChild(dom.element)

// Parse and feed
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

// Play
base.play(0)

// Pause
base.pause()
```

Every visual aspect is mapped to a config field. Pass only the fields you want to change, leave the rest at their defaults. Updates can be applied at any time, including mid-playback.

```js
dom.config.update({
  layout: { gap: 50 },
  effect: {
    blur: { enabled: true, min: 0.4, max: 4.5 },
    scale: { enabled: true },
  },
  scroll: {
    anchor: 50,
    animation: { mode: 'ripple', duration: 500, range: 5, step: 40 },
  },
  line: {
    normal: {
      base: { font: { size: 48 } },
      syllable: { animation: { float: { enabled: true, to: 2 } } },
    },
  },
})
```

## Packages

| Package                                       | Description |
| --------------------------------------------- | ----------- |
| [music-lyric-player](./main)                  | Main entry  |
| [@music-lyric-player/utils](./packages/utils) | Utilities   |
| [@music-lyric-player/base](./packages/base)   | Base player |
| [@music-lyric-player/dom](./packages/dom)     | DOM player  |

## Contributors

[![Contributors](https://contrib.rocks/image?repo=music-lyric/music-lyric-player-web)](https://github.com/music-lyric/music-lyric-player-web/graphs/contributors)

## License

[MIT](./LICENSE)

Copyright (c) 2026 - now, Folltoshe
