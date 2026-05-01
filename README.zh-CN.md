<p align="center">
  <img
    src="https://socialify.git.ci/music-lyric/music-lyric-player-web/image?custom_description=Music+Lyric+Player&description=1&font=Inter&forks=1&issues=1&language=1&name=1&owner=1&pattern=Plus&pulls=1&stargazers=1&theme=Auto"
  />
</p>

<p align="center">一个动画丰富、高度可自定义的 Web 播放器</p>

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
  <a href="./README.md">English</a> | 简体中文 | <a href="./README.zh-TW.md">繁體中文</a>
</p>

> [!WARNING]
>
> 本项目目前仍在开发中，部分接口尚未稳定。

## 特性

- **内置动画**：逐字浮动、卡拉OK 风格遮罩、按距离衰减的模糊与缩放、容器边缘羽化淡出。每一项均可独立开关与调参
- **四种滚动模式**：smooth、ripple、directional、stagger，单个字段即可改变整体滚动观感
- **歌词结构感知**：逐字级高亮、翻译与音译扩展行、间奏占位符、normal / active / played 三态样式
- **配置自由、热更新**：每个视觉模块（container / layout / effect / scroll / line）都是层层可选的配置切片，覆盖你关心的字段即可，并且支持播放过程中实时修改，无需卸载重挂或闪烁
- **可插拔、GPU 友好**：计时与歌词状态位于 `base`，零 DOM 依赖；渲染逻辑位于 `dom`，基于 CSS transform / filter。必要时可替换为自定义渲染层

## 安装

```shell
npm install music-lyric-player music-lyric-kit
```

> [!INFO]
>
> 歌词解析由 [`music-lyric-kit`](https://github.com/music-lyric/music-lyric-kit-node) 提供，需要一并安装。

## 使用

播放器由两层组成：`BaseLyricPlayer` 负责计时与歌词状态，`DomLyricPlayer` 负责将其渲染到 DOM。两者通常配合使用。

### 基础播放器

如果你打算自行实现渲染层，可以直接依赖 `@music-lyric-player/base`。它仅包含计时与状态逻辑，不涉及 DOM。

```js
import { BaseLyricPlayer } from '@music-lyric-player/base'

const base = new BaseLyricPlayer()

const callback = () => {}

// 播放事件
base.event.add('play', callback)
// 暂停事件
base.event.add('pause', callback)
// 歌词更新事件
base.event.add('lyricUpdate', callback)
// 播放行更新事件
base.event.add('linesUpdate', callback)

// 更新歌词
// 需要传入 music-lyric-kit 的解析结果
base.updateLyric(result)

// 播放
base.play(0)
```

### DOM播放器

```js
import { BaseLyricPlayer } from '@music-lyric-player/base'
import { DomLyricPlayer } from '@music-lyric-player/dom'
import { ParserPipeline } from 'music-lyric-kit'

// 创建
const base = new BaseLyricPlayer()
const dom = new DomLyricPlayer(base)

// 挂载
const container = window.document.getElementById('lyric-container')
container.appendChild(dom.element)

// 解析歌词后传入
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

// 暂停
base.pause()
```

所有视觉相关的设置都对应一个配置字段。仅需传入你想修改的字段，其余保持默认即可，并且支持在播放过程中实时更新。

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

## 包一览

| 包名                                          | 说明       |
| --------------------------------------------- | ---------- |
| [music-lyric-player](./main)                  | 主入口     |
| [@music-lyric-player/utils](./packages/utils) | 工具库     |
| [@music-lyric-player/base](./packages/base)   | 基础播放器 |
| [@music-lyric-player/dom](./packages/dom)     | DOM播放器  |

## 贡献者

[![Contributors](https://contrib.rocks/image?repo=music-lyric/music-lyric-player-web)](https://github.com/music-lyric/music-lyric-player-web/graphs/contributors)

## 许可证

[MIT](./LICENSE)

Copyright (c) 2026 - now, Folltoshe
