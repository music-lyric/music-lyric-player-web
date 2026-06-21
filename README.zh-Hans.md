<p align="center">
  <img
    src="https://socialify.git.ci/music-lyric/music-lyric-player-web/image?custom_description=Music+Lyric+Player&description=1&font=Inter&forks=1&issues=1&language=1&name=1&owner=1&pattern=Plus&pulls=1&stargazers=1&theme=Auto"
  />
</p>

<p align="center">一个动画丰富、高度可定制的 Web 歌词播放器</p>

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
  <a href="./README.md">English</a> | 简体中文 | <a href="./README.zh-Hant.md">繁體中文</a>
</p>

> [!WARNING]
>
> 本项目仍在活跃开发中，部分 API 尚未稳定。

## 特性

- **内置动画**：逐字浮动与卡拉OK 式遮罩擦除、按距离衰减的模糊与缩放、容器边缘羽化淡出——每一项都可独立开关与调参
- **四种滚动模式**：smooth、ripple、directional、stagger，单个字段即可改变整体滚动观感
- **歌词结构感知**：逐字级高亮、翻译与音译扩展行、间奏占位符，以及 normal / active / played 三态样式
- **配置自由、实时生效**：每个视觉模块（container / layout / effect / scroll / line）都是层层可选的配置切片——只覆盖你关心的字段，并可在播放过程中实时修改，无需卸载重挂或闪烁
- **可插拔、GPU 友好**：计时与状态位于 `base`，零 DOM 依赖；渲染由 `dom` 基于 CSS transform / filter 实现，因此你也可以接入自定义渲染层

## 安装

```shell
npm install music-lyric-player music-lyric-kit
```

> [!IMPORTANT]
>
> 歌词解析由 [`music-lyric-kit`](https://github.com/music-lyric/music-lyric-kit-node) 提供，需要与播放器一并安装。

## 使用

`BaseLyricPlayer` 负责计时与歌词状态，`DomLyricPlayer` 负责将其渲染到 DOM。两者通常配合使用——安装上面的 `music-lyric-player`，并直接从中导入两者。

```js
import { BaseLyricPlayer, DomLyricPlayer } from 'music-lyric-player'
import { ParserPipeline } from 'music-lyric-kit'

// 创建
const base = new BaseLyricPlayer()
const dom = new DomLyricPlayer(base)

// 挂载
const container = window.document.getElementById('lyric-container')
container.appendChild(dom.element)

// 解析并传入
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

所有视觉设置都对应一个配置字段。只需传入想修改的字段，其余保持默认即可，且可在任意时刻（包括播放过程中）更新。

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

### 仅基础播放器

如果你只需要计时与状态——例如要自行实现渲染层——只需安装 `@music-lyric-player/base`（零 DOM 依赖）并从中导入。

```shell
npm install @music-lyric-player/base music-lyric-kit
```

```js
import { BaseLyricPlayer } from '@music-lyric-player/base'

const base = new BaseLyricPlayer()

// 订阅计时 / 状态事件
base.event.add('play', (time) => {})
base.event.add('pause', (time) => {})
base.event.add('lyricUpdate', (info) => {})
base.event.add('linesUpdate', (lines, indexes, firstActiveIndex, isSeek) => {})

// 传入 music-lyric-kit 的解析结果（解析方式见上），然后播放
base.updateLyric(result)
base.play(0)
```

## 包一览

| 包名                                          | 说明       |
| --------------------------------------------- | ---------- |
| [music-lyric-player](./main)                  | 主入口     |
| [@music-lyric-player/utils](./packages/utils) | 工具库     |
| [@music-lyric-player/base](./packages/base)   | 基础播放器 |
| [@music-lyric-player/dom](./packages/dom)     | DOM 播放器 |

## 贡献者

[![Contributors](https://contrib.rocks/image?repo=music-lyric/music-lyric-player-web)](https://github.com/music-lyric/music-lyric-player-web/graphs/contributors)

## 许可证

[MIT](./LICENSE)

Copyright (c) 2026 - now, Folltoshe
