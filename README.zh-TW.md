<p align="center">
  <img
    src="https://socialify.git.ci/music-lyric/music-lyric-player-web/image?custom_description=Music+Lyric+Player&description=1&font=Inter&forks=1&issues=1&language=1&name=1&owner=1&pattern=Plus&pulls=1&stargazers=1&theme=Auto"
  />
</p>

<p align="center">一個動畫豐富、高度可自訂的 Web 播放器</p>

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
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | 繁體中文
</p>

> [!WARNING]
>
> 本專案目前仍在開發中，部分介面（API）尚未穩定。

## 特性

- **內建動畫**：逐字浮動、卡拉OK 風格遮罩、依距離衰減的模糊與縮放、容器邊緣羽化淡出。每一項皆可獨立開關與調整
- **四種捲動模式**：smooth、ripple、directional、stagger，單一欄位即可改變整體捲動觀感
- **歌詞結構感知**：逐字級高亮、翻譯與音譯擴展行、間奏佔位符、normal / active / played 三態樣式
- **配置自由、熱更新**：每個視覺模組（container / layout / effect / scroll / line）皆為層層可選的配置切片，僅需覆寫你在意的欄位，並支援於播放過程中即時修改，無需卸載重新掛載或閃爍
- **可插拔、GPU 友善**：計時與歌詞狀態位於 `base`，零 DOM 依賴；渲染邏輯位於 `dom`，基於 CSS transform / filter。必要時可替換為自訂渲染層

## 安裝

```shell
npm install music-lyric-player music-lyric-kit
```

> [!IMPORTANT]
>
> 歌詞解析由 [`music-lyric-kit`](https://github.com/music-lyric/music-lyric-kit-node) 提供，需要一併安裝。

## 使用方式

播放器由兩層組成：`BaseLyricPlayer` 負責計時與歌詞狀態，`DomLyricPlayer` 負責將其渲染至 DOM。兩者通常搭配使用。

### 基礎播放器

如果你打算自行實作渲染層，可以直接依賴 `@music-lyric-player/base`。它僅包含計時與狀態邏輯，不涉及 DOM。

```js
import { BaseLyricPlayer } from '@music-lyric-player/base'

const base = new BaseLyricPlayer()

const callback = () => {}

// 播放事件
base.event.add('play', callback)
// 暫停事件
base.event.add('pause', callback)
// 歌詞更新事件
base.event.add('lyricUpdate', callback)
// 播放行更新事件
base.event.add('linesUpdate', callback)

// 更新歌詞
// 需要傳入 music-lyric-kit 的解析結果
base.updateLyric(result)

// 播放
base.play(0)
```

### DOM播放器

```js
import { BaseLyricPlayer } from '@music-lyric-player/base'
import { DomLyricPlayer } from '@music-lyric-player/dom'
import { ParserPipeline } from 'music-lyric-kit'

// 建立
const base = new BaseLyricPlayer()
const dom = new DomLyricPlayer(base)

// 掛載
const container = window.document.getElementById('lyric-container')
container.appendChild(dom.element)

// 解析歌詞後傳入
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

所有視覺相關的設定皆對應一個配置欄位。僅需傳入你想修改的欄位，其餘保持預設即可，並支援於播放過程中即時更新。

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

## 套件一覽

| 套件名稱                                      | 說明       |
| --------------------------------------------- | ---------- |
| [music-lyric-player](./main)                  | 主入口     |
| [@music-lyric-player/utils](./packages/utils) | 工具庫     |
| [@music-lyric-player/base](./packages/base)   | 基礎播放器 |
| [@music-lyric-player/dom](./packages/dom)     | DOM播放器  |

## 貢獻者

[![Contributors](https://contrib.rocks/image?repo=music-lyric/music-lyric-player-web)](https://github.com/music-lyric/music-lyric-player-web/graphs/contributors)

## 授權條款

[MIT](./LICENSE)

Copyright (c) 2026 - now, Folltoshe
