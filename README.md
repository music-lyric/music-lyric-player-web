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
  English | <a href="./README.zh-Hans.md">简体中文</a> | <a href="./README.zh-Hant.md">繁體中文</a>
</p>

> [!WARNING]
>
> This project is under active development; some APIs are not yet stable.

## Features

- **Built-in animations**: per-syllable float and karaoke wipe, distance-based blur and scale, and container edge fade — every effect toggles and tunes independently
- **Four scroll modes**: smooth, ripple, directional, and stagger; one field changes the entire scroll feel
- **Lyric-aware rendering**: syllable-level highlighting, translation and romanization sub-lines, interlude markers, and per-state styling for normal / active / played
- **Configure everything, live**: every visual concern (container / layout / effect / scroll / line) is its own deeply optional slice — override what matters and update mid-playback without remount or flicker
- **Pluggable, GPU-friendly**: timing and state live in `base` with zero DOM dependency; rendering uses CSS transforms and filters in `dom`, so you can plug in your own renderer

## Install

```shell
npm install music-lyric-player music-lyric-kit
```

> [!IMPORTANT]
>
> Lyric data is parsed by [`music-lyric-kit`](https://github.com/music-lyric/music-lyric-kit-node), which needs to be installed alongside the player.

## Usage

`BaseLyricPlayer` owns timing and lyric state, while `DomLyricPlayer` renders the result to the DOM. They are typically used together — install `music-lyric-player` (above) and import both directly from it.

```js
import { BaseLyricPlayer, DomLyricPlayer } from 'music-lyric-player'
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

Every visual aspect maps to a config field. Pass only the fields you want to change; the rest keep their defaults. Updates apply any time, including mid-playback.

```js
dom.config.merge({
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

### Base player only

If you only need timing and state — for example to build your own renderer — install just `@music-lyric-player/base` (no DOM dependency) and import from it.

```shell
npm install @music-lyric-player/base music-lyric-kit
```

```js
import { BaseLyricPlayer } from '@music-lyric-player/base'

const base = new BaseLyricPlayer()

// Subscribe to timing / state events
base.event.add('play', (time) => {})
base.event.add('pause', (time) => {})
base.event.add('lyricUpdate', (info) => {})
base.event.add('linesUpdate', (lines, indexes, firstActiveIndex, isSeek) => {})

// Feed the parsed result from music-lyric-kit (parsed as shown above), then play
base.updateLyric(result)
base.play(0)
```

## Custom Styling

The config covers the common visual tweaks. For finer control, every internal element carries a stable `data-role` attribute and stateful nodes carry plain boolean attributes — together they are a public CSS contract you can target directly, with nothing hidden behind hashed class names.

Each instance also reflects a unique `data-instance-id` on its root element, so you can scope rules to one player (via `dom.instanceId`) or match every instance with the bare `[data-instance-id]` selector.

**Element roles** (nesting under a single line; `line-normal` and `line-interlude` are mutually exclusive bodies, and `*-word` / `*-char` appear only for syllable-timed lyrics):

```
[data-role="root"] [data-instance-id]
└─ [data-role="container"]
   └─ [data-role="line"]
      ├─ [data-role="line-normal"]
      │  ├─ [data-role="line-normal-text"]
      │  │  └─ [data-role="line-normal-text-word"]
      │  │     └─ [data-role="line-normal-text-word-char"]
      │  └─ [data-role="line-normal-annotation"]
      │     ├─ [data-role="line-normal-annotation-translation"]
      │     └─ [data-role="line-normal-annotation-romanization"]
      └─ [data-role="line-interlude"]
         └─ [data-role="line-interlude-dot"]
```

**State attributes** (toggled at runtime — combine them in selectors):

| Element | Attribute | Meaning |
| --- | --- | --- |
| `[data-role="line"]` | `active` | the line is currently being sung |
| `[data-role="line"]` | `played` | the line has already been played |
| `[data-role="line"]` | `animatable` | the line is inside the animation window |
| `[data-role="line"]` | `position` | horizontal alignment (`left` / `center` / `right`), used in duet mode |
| `[data-role="container"]` | `enable-fade` | container edge fade is enabled |
| `[data-role="container"]` | `scrolling` | the user is scrolling |

**Examples:**

```css
/* Glow on every character */
[data-instance-id] [data-role="line-normal-text-word-char"] {
  text-shadow: 0 0 4px currentColor;
}

/* Emphasize the active line's text */
[data-instance-id] [data-role="line"][active] [data-role="line-normal-text"] {
  font-weight: 700;
}

/* Dim lines that are already played */
[data-instance-id] [data-role="line"][played] {
  opacity: 0.5;
}

/* Tone down the translation sub-line */
[data-instance-id] [data-role="line-normal-annotation-translation"] {
  font-size: 0.8em;
  opacity: 0.7;
}
```

Prefer your own class hooks? `container.className` and `line.className` remain in the config — set them to attach custom theme classes to the container and to every line.

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
