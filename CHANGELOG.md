## v0.6.0 (2026-05-02)

### Document

- fix readme alerts ([a9fcbdd](https://github.com/music-lyric/music-lyric-player-web/commit/a9fcbdd))
- update readme ([cfac337](https://github.com/music-lyric/music-lyric-player-web/commit/cfac337))

### Feature

- `dom`
  - add mask animation config for syllable line ([a48609b](https://github.com/music-lyric/music-lyric-player-web/commit/a48609b))
  - add float animation config for syllable line ([a76588f](https://github.com/music-lyric/music-lyric-player-web/commit/a76588f))
  - add transition for line active state changes ([61e35d2](https://github.com/music-lyric/music-lyric-player-web/commit/61e35d2))
- `utils`
  - add substring matching helpers for collections ([8b5a46a](https://github.com/music-lyric/music-lyric-player-web/commit/8b5a46a))

### Fix

- `dom`
  - root component was not properly destroyed ([c2ce566](https://github.com/music-lyric/music-lyric-player-web/commit/c2ce566))
  - incorrect max in line blur ([224a92d](https://github.com/music-lyric/music-lyric-player-web/commit/224a92d))
  - scroll direction in stagger animation ([0b5f4f9](https://github.com/music-lyric/music-lyric-player-web/commit/0b5f4f9))
  - default config ([e42f130](https://github.com/music-lyric/music-lyric-player-web/commit/e42f130))

### Performance

- `dom`
  - skip style writes when value unchanged on line element ([565583a](https://github.com/music-lyric/music-lyric-player-web/commit/565583a))
  - reuse style object when update line layout ([8fa7d02](https://github.com/music-lyric/music-lyric-player-web/commit/8fa7d02))
  - snapshot elements when update line layout ([a19148a](https://github.com/music-lyric/music-lyric-player-web/commit/a19148a))
  - cache active set when query active elements ([8c4f8e9](https://github.com/music-lyric/music-lyric-player-web/commit/8c4f8e9))
  - skip element rebuild when no watched config key changed ([1a9cbc4](https://github.com/music-lyric/music-lyric-player-web/commit/1a9cbc4))

### Refactor

- `dom`
  - rename base line element fields ([099ca42](https://github.com/music-lyric/music-lyric-player-web/commit/099ca42))
  - modularize config ([e01fecf](https://github.com/music-lyric/music-lyric-player-web/commit/e01fecf))
- `playground`
  - lyric select ([8932e39](https://github.com/music-lyric/music-lyric-player-web/commit/8932e39))
- `utils`
  - config compare ([81f2ab7](https://github.com/music-lyric/music-lyric-player-web/commit/81f2ab7))

## v0.5.0 (2026-04-26)

### Feature

- `base`
  - support change driver ([910b40f](https://github.com/music-lyric/music-lyric-player-web/commit/910b40f))
- `dom`
  - auto-hide interlude line when the normal style opacity is 0 ([95008f2](https://github.com/music-lyric/music-lyric-player-web/commit/95008f2))
  - add collapse and expand animations to the background line ([9b03fe1](https://github.com/music-lyric/music-lyric-player-web/commit/9b03fe1))
  - add stagger mode for scroll animation ([aa54615](https://github.com/music-lyric/music-lyric-player-web/commit/aa54615))

### Fix

- type error ([2cd1ff8](https://github.com/music-lyric/music-lyric-player-web/commit/2cd1ff8))
- `dom`
  - first line incorrectly activated after lyrics update ([16964be](https://github.com/music-lyric/music-lyric-player-web/commit/16964be))
  - embed style do not exist in development mode ([0527e20](https://github.com/music-lyric/music-lyric-player-web/commit/0527e20))
  - embed style was not applied ([b2aae13](https://github.com/music-lyric/music-lyric-player-web/commit/b2aae13))
  - line played state was incorrectly set ([190a347](https://github.com/music-lyric/music-lyric-player-web/commit/190a347))

### Refactor

- `dom`
  - config ([503052e](https://github.com/music-lyric/music-lyric-player-web/commit/503052e))
  - context ([78db468](https://github.com/music-lyric/music-lyric-player-web/commit/78db468))

## v0.4.0 (2026-04-26)

### Feature

- `base`
  - lines update event add is in seek param ([ed95eb0](https://github.com/music-lyric/music-lyric-player-web/commit/ed95eb0))
- `dom`
  - add mask animation for line word ([e1b76c3](https://github.com/music-lyric/music-lyric-player-web/commit/e1b76c3))

### Fix

- `dom`
  - the position of a completed word was incorrect when switch play state ([e62f821](https://github.com/music-lyric/music-lyric-player-web/commit/e62f821))
  - playback was triggered when not playing ([751ff96](https://github.com/music-lyric/music-lyric-player-web/commit/751ff96))
  - incorrect active line when scrolling ([743d1f5](https://github.com/music-lyric/music-lyric-player-web/commit/743d1f5))
  - played background line not show when scrolling ([f1044b4](https://github.com/music-lyric/music-lyric-player-web/commit/f1044b4))
  - an incorrect function call occurred while multiple lines play ([a08dccb](https://github.com/music-lyric/music-lyric-player-web/commit/a08dccb))

### Refactor

- `dom`
  - optimize code ([9ef62e4](https://github.com/music-lyric/music-lyric-player-web/commit/9ef62e4))

## v0.3.0 (2026-04-20)

### Feature

- `base`
  - support query active lines by a timestamp ([5ff017e](https://github.com/music-lyric/music-lyric-player-web/commit/5ff017e))
  - support get current is playing ([12093de](https://github.com/music-lyric/music-lyric-player-web/commit/12093de))
- `dom`
  - support add edge fade mask for container ([34982db](https://github.com/music-lyric/music-lyric-player-web/commit/34982db))
  - support add padding for container ([ed75a4c](https://github.com/music-lyric/music-lyric-player-web/commit/ed75a4c))
  - skip primitive types in deep util type tools ([126cf03](https://github.com/music-lyric/music-lyric-player-web/commit/126cf03))
  - add scroll animation ([07e3075](https://github.com/music-lyric/music-lyric-player-web/commit/07e3075))
  - support blur lyric line ([254137d](https://github.com/music-lyric/music-lyric-player-web/commit/254137d))
  - support scaling lyric line ([84a79d3](https://github.com/music-lyric/music-lyric-player-web/commit/84a79d3))
- `playground`
  - support custom scroll animation config ([e1387f4](https://github.com/music-lyric/music-lyric-player-web/commit/e1387f4))

### Fix

- `dom`
  - unable to scroll lyrics immediately after loading ([fcf8442](https://github.com/music-lyric/music-lyric-player-web/commit/fcf8442))
  - background line not show when scrolling ([73e75fc](https://github.com/music-lyric/music-lyric-player-web/commit/73e75fc))

### Refactor

- `base`
  - optimize code ([93b7a5c](https://github.com/music-lyric/music-lyric-player-web/commit/93b7a5c))
- `dom`
  - change the root field to container field ([5816f69](https://github.com/music-lyric/music-lyric-player-web/commit/5816f69))
  - expose bundled style as variable ([7710799](https://github.com/music-lyric/music-lyric-player-web/commit/7710799))

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

### Fix

- `dom`
  - prevent main line from being pushed out of viewport ([8090c65](https://github.com/music-lyric/music-lyric-player-web/commit/8090c65))
  - background line not show when scrolling ([a424553](https://github.com/music-lyric/music-lyric-player-web/commit/a424553))

### Refactor

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

### Fix

- tsconfig ([bfd7c7d](https://github.com/music-lyric/music-lyric-player-web/commit/bfd7c7d))
- `dom`
  - incorrect variable name ([dcb8a55](https://github.com/music-lyric/music-lyric-player-web/commit/dcb8a55))
  - incorrect attribute ([7f0548e](https://github.com/music-lyric/music-lyric-player-web/commit/7f0548e))

### Refactor

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
