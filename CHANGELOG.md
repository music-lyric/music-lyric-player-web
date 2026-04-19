## v0.2.0 (2026-04-19)

### Feature

- `base`
  - support get current active lines index ([78c05cf](https://github.com/music-lyric/music-lyric-player-web/commit/78c05cf))
- `dom`
  - support custom played style ([e8e4979](https://github.com/music-lyric/music-lyric-player-web/commit/e8e4979))
  - add config interface export ([a809bf8](https://github.com/music-lyric/music-lyric-player-web/commit/a809bf8))
  - support show background line ([7c55a75](https://github.com/music-lyric/music-lyric-player-web/commit/7c55a75))
  - support handle scroll event ([003873f](https://github.com/music-lyric/music-lyric-player-web/commit/003873f))
  - prevent user select text ([f8b807b](https://github.com/music-lyric/music-lyric-player-web/commit/f8b807b))
- `playground`
  - support custom played style ([ba877f2](https://github.com/music-lyric/music-lyric-player-web/commit/ba877f2))
  - support edit config ([1e863db](https://github.com/music-lyric/music-lyric-player-web/commit/1e863db))
- `utils`
  - compare object support return parent path ([085fa52](https://github.com/music-lyric/music-lyric-player-web/commit/085fa52))

### Bug Fix

- `dom`
  - prevent main line from being pushed out of viewport ([8090c65](https://github.com/music-lyric/music-lyric-player-web/commit/8090c65))
  - background line not show when scrolling ([a424553](https://github.com/music-lyric/music-lyric-player-web/commit/a424553))

### Code Refactor

- `dom`
  - optimize background line gap ([03de27b](https://github.com/music-lyric/music-lyric-player-web/commit/03de27b))
  - config structure ([8056f1a](https://github.com/music-lyric/music-lyric-player-web/commit/8056f1a))
  - line config ([e250bb1](https://github.com/music-lyric/music-lyric-player-web/commit/e250bb1))
  - config ([9dcd24c](https://github.com/music-lyric/music-lyric-player-web/commit/9dcd24c))
- `utils`
  - deep type tools ([22607f2](https://github.com/music-lyric/music-lyric-player-web/commit/22607f2))

## v0.1.0 (2026-04-11)

### Document

- update readme ([871f0a3](https://github.com/music-lyric/music-lyric-player-web/commit/871f0a3))

### Feature

- `base`
  - add play action event ([5f66a46](https://github.com/music-lyric/music-lyric-player-web/commit/5f66a46))
  - keep the last line ([0094bb9](https://github.com/music-lyric/music-lyric-player-web/commit/0094bb9))
  - add current state getter ([566d625](https://github.com/music-lyric/music-lyric-player-web/commit/566d625))
  - add base player ([597c1fc](https://github.com/music-lyric/music-lyric-player-web/commit/597c1fc))
- `dom`
  - support show interlude line ([1145f49](https://github.com/music-lyric/music-lyric-player-web/commit/1145f49))
  - support show syllable lyric ([cdde953](https://github.com/music-lyric/music-lyric-player-web/commit/cdde953))
  - support custom class name ([8c798db](https://github.com/music-lyric/music-lyric-player-web/commit/8c798db))
  - scrolling with the current playing line ([88d35b4](https://github.com/music-lyric/music-lyric-player-web/commit/88d35b4))
  - add base dom player ([57ccd55](https://github.com/music-lyric/music-lyric-player-web/commit/57ccd55))
- `main`
  - add export ([92c1450](https://github.com/music-lyric/music-lyric-player-web/commit/92c1450))
- `playground`
  - add player ([9cf58e6](https://github.com/music-lyric/music-lyric-player-web/commit/9cf58e6))
  - add base content ([31c520f](https://github.com/music-lyric/music-lyric-player-web/commit/31c520f))
- `utils`
  - add event client ([a3d143d](https://github.com/music-lyric/music-lyric-player-web/commit/a3d143d))
  - add util tools ([862b867](https://github.com/music-lyric/music-lyric-player-web/commit/862b867))

### Bug Fix

- tsconfig ([bfd7c7d](https://github.com/music-lyric/music-lyric-player-web/commit/bfd7c7d))
- `dom`
  - incorrect variable name ([dcb8a55](https://github.com/music-lyric/music-lyric-player-web/commit/dcb8a55))
  - incorrect attribute ([7f0548e](https://github.com/music-lyric/music-lyric-player-web/commit/7f0548e))

### Code Refactor

- `base`
  - event call ([68430b1](https://github.com/music-lyric/music-lyric-player-web/commit/68430b1))
  - use common event client ([7a8b7b3](https://github.com/music-lyric/music-lyric-player-web/commit/7a8b7b3))
- `dom`
  - optimize code ([67a0966](https://github.com/music-lyric/music-lyric-player-web/commit/67a0966))
  - components ([e709562](https://github.com/music-lyric/music-lyric-player-web/commit/e709562))
- `playground`
  - optimize code ([c5ae4e0](https://github.com/music-lyric/music-lyric-player-web/commit/c5ae4e0))
- `utils`
  - config manager events ([0adf348](https://github.com/music-lyric/music-lyric-player-web/commit/0adf348))
  - event client ([9afbdc8](https://github.com/music-lyric/music-lyric-player-web/commit/9afbdc8))
