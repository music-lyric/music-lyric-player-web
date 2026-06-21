# @music-lyric-player/dom

Renders the timing state produced by [`@music-lyric-player/base`](https://github.com/music-lyric/music-lyric-player-web/tree/main/packages/base) to the DOM. Uses CSS transforms, filters, and the Web Animations API for GPU-friendly visuals: per-syllable wipe, float, distance-based blur and scale, container edge fade, and four scroll modes.

Every visual concern is a deeply optional config slice and can be updated live mid-playback without remount or flicker.

## Install

```shell
npm install @music-lyric-player/dom @music-lyric-player/base music-lyric-kit
```

## Usage

```js
import { BaseLyricPlayer } from '@music-lyric-player/base'
import { DomLyricPlayer } from '@music-lyric-player/dom'

const base = new BaseLyricPlayer()
const dom = new DomLyricPlayer(base)

document.getElementById('lyric-container').appendChild(dom.element)
```

The `dom.element` is a regular DOM node — attach it anywhere. The renderer subscribes to `base`'s events; just feed lyric data and play.

## Live configuration

Pass only the fields you want to override; everything else falls back to the defaults. Updates apply immediately, including mid-playback.

```js
dom.config.update({
  container: { fade: { enabled: true, top: '5%', bottom: '10%' } },
  layout: { align: 'left', gap: 50, duet: { enabled: true } },
  effect: {
    blur: { enabled: true, min: 0.4, max: 4.5 },
    scale: { enabled: true, min: 0.65, max: 1 },
  },
  scroll: {
    anchor: 50,
    animation: { mode: 'ripple', duration: 500, range: 5, step: 40 },
  },
  line: {
    normal: {
      base: { font: { size: 48 } },
      syllable: { animation: { float: { enabled: true, to: 2 }, mask: { enabled: true } } },
      extended: { visible: true, translate: { visible: true }, roman: { visible: false } },
    },
  },
})
```

## Scroll modes

| Mode          | Behavior                                                            |
| ------------- | ------------------------------------------------------------------- |
| `smooth`      | All lines move together. Optional fixed `delay`                     |
| `ripple`      | Symmetric cascade radiating outward from the active line            |
| `directional` | Asymmetric cascade — played lines move first, upcoming lines follow |
| `stagger`     | Linear, direction-sensitive stagger                                 |

## Teardown

```js
dom.destroy()
```
