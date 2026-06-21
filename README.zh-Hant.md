<p align="center">
  <img
    src="https://socialify.git.ci/music-lyric/music-lyric-player-web/image?custom_description=Music+Lyric+Player&description=1&font=Inter&forks=1&issues=1&language=1&name=1&owner=1&pattern=Plus&pulls=1&stargazers=1&theme=Auto"
  />
</p>

<p align="center">一個動畫豐富、高度可自訂的 Web 歌詞播放器</p>

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
  <a href="./README.md">English</a> | <a href="./README.zh-Hans.md">简体中文</a> | 繁體中文
</p>

> [!WARNING]
>
> 本專案仍在積極開發中，部分 API 尚未穩定。

## 特性

- **內建動畫**：逐字浮動與卡拉OK 式遮罩擦除、依距離衰減的模糊與縮放、容器邊緣羽化淡出——每一項皆可獨立開關與調整
- **四種捲動模式**：smooth、ripple、directional、stagger，單一欄位即可改變整體捲動觀感
- **歌詞結構感知**：逐字級高亮、翻譯與音譯擴展行、間奏佔位符，以及 normal / active / played 三態樣式
- **配置自由、即時生效**：每個視覺模組（container / layout / effect / scroll / line）皆為層層可選的配置切片——僅覆寫你在意的欄位，並可於播放過程中即時修改，無需卸載重新掛載或閃爍
- **可插拔、GPU 友善**：計時與狀態位於 `base`，零 DOM 依賴；渲染由 `dom` 基於 CSS transform / filter 實作，因此你也可接入自訂渲染層

## 安裝

```shell
npm install music-lyric-player music-lyric-kit
```

> [!IMPORTANT]
>
> 歌詞解析由 [`music-lyric-kit`](https://github.com/music-lyric/music-lyric-kit-node) 提供，需與播放器一併安裝。

## 使用方式

`BaseLyricPlayer` 負責計時與歌詞狀態，`DomLyricPlayer` 負責將其渲染至 DOM。兩者通常搭配使用——安裝上方的 `music-lyric-player`，並直接從中匯入兩者。

```js
import { BaseLyricPlayer, DomLyricPlayer } from 'music-lyric-player'
import { ParserPipeline } from 'music-lyric-kit'

// 建立
const base = new BaseLyricPlayer()
const dom = new DomLyricPlayer(base)

// 掛載
const container = window.document.getElementById('lyric-container')
container.appendChild(dom.element)

// 解析後傳入
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

// 播放
base.play(0)

// 暫停
base.pause()
```

所有視覺設定皆對應一個配置欄位。僅需傳入想修改的欄位，其餘保持預設即可，並可於任意時刻（包含播放過程中）更新。

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

### 僅基礎播放器

如果你只需要計時與狀態——例如要自行實作渲染層——只需安裝 `@music-lyric-player/base`（零 DOM 依賴）並從中匯入。

```shell
npm install @music-lyric-player/base music-lyric-kit
```

```js
import { BaseLyricPlayer } from '@music-lyric-player/base'

const base = new BaseLyricPlayer()

// 訂閱計時 / 狀態事件
base.event.add('play', (time) => {})
base.event.add('pause', (time) => {})
base.event.add('lyricUpdate', (info) => {})
base.event.add('linesUpdate', (lines, indexes, firstActiveIndex, isSeek) => {})

// 傳入 music-lyric-kit 的解析結果（解析方式見上），然後播放
base.updateLyric(result)
base.play(0)
```

## 套件一覽

| 套件名稱                                      | 說明       |
| --------------------------------------------- | ---------- |
| [music-lyric-player](./main)                  | 主入口     |
| [@music-lyric-player/utils](./packages/utils) | 工具庫     |
| [@music-lyric-player/base](./packages/base)   | 基礎播放器 |
| [@music-lyric-player/dom](./packages/dom)     | DOM 播放器 |

## 貢獻者

[![Contributors](https://contrib.rocks/image?repo=music-lyric/music-lyric-player-web)](https://github.com/music-lyric/music-lyric-player-web/graphs/contributors)

## 授權條款

[MIT](./LICENSE)

Copyright (c) 2026 - now, Folltoshe
