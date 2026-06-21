# music-lyric-player

[**GitHub**](https://github.com/music-lyric/music-lyric-player-web) — full documentation, examples, and API.

An animation-rich, highly customizable web lyric player. The all-in-one package: re-exports `@music-lyric-player/base` (timing & state) and `@music-lyric-player/dom` (renderer).

## Install

Lyric data is parsed by [`music-lyric-kit`](https://github.com/music-lyric/music-lyric-kit-node), which must be installed alongside the player.

```shell
npm install music-lyric-player music-lyric-kit
```

## Usage

```js
import { BaseLyricPlayer, DomLyricPlayer } from 'music-lyric-player'
import { ParserPipeline } from 'music-lyric-kit'

const base = new BaseLyricPlayer()
const dom = new DomLyricPlayer(base)

// Mount the renderer
document.getElementById('lyric-container').appendChild(dom.element)

// Parse lyric with music-lyric-kit, then feed the player
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
