## v0.18.0 (2026-07-19)

### Document

- update readme ([5b4764e](https://github.com/music-lyric/music-lyric-player-web/commit/5b4764e))

### Feature

- bump lyric model version ([d96ed68](https://github.com/music-lyric/music-lyric-player-web/commit/d96ed68))
- `dom`
  - group merged line exit animation ([287cdbe](https://github.com/music-lyric/music-lyric-player-web/commit/287cdbe))

### Fix

- `dom`
  - prevent word annotation clipping ([03dad11](https://github.com/music-lyric/music-lyric-player-web/commit/03dad11))
  - align word annotation rows ([544d779](https://github.com/music-lyric/music-lyric-player-web/commit/544d779))
  - prevent virtualized line flash ([7416453](https://github.com/music-lyric/music-lyric-player-web/commit/7416453))
  - restore played line style while scrolling ([4c2415d](https://github.com/music-lyric/music-lyric-player-web/commit/4c2415d))

### Refactor

- `utils`
  - simplify config manager interface ([0850950](https://github.com/music-lyric/music-lyric-player-web/commit/0850950))

## v0.17.0 (2026-06-25)

### Feature

- `dom`
  - virtualize off-screen line rendering ([8fbf309](https://github.com/music-lyric/music-lyric-player-web/commit/8fbf309))
  - add timeline-adaptive word annotation wipe ([0da6367](https://github.com/music-lyric/music-lyric-player-web/commit/0da6367))
  - center syllable word annotation rows ([c6b1f8f](https://github.com/music-lyric/music-lyric-player-web/commit/c6b1f8f))

### Fix

- `dom`
  - re-measure line height on annotation visibility toggle ([7cb4529](https://github.com/music-lyric/music-lyric-player-web/commit/7cb4529))

### Performance

- `dom`
  - hoist layout config reads out of the per-line loop ([10cf1e8](https://github.com/music-lyric/music-lyric-player-web/commit/10cf1e8))

## v0.16.0 (2026-06-25)

### Feature

- bump lyric model version ([f6ad7d6](https://github.com/music-lyric/music-lyric-player-web/commit/f6ad7d6))
- `dom`
  - add annotation language preference ([e4a6c5f](https://github.com/music-lyric/music-lyric-player-web/commit/e4a6c5f))
  - add per-word ruby ([ba9ab7c](https://github.com/music-lyric/music-lyric-player-web/commit/ba9ab7c))
  - allow keyword font weight ([48b2fad](https://github.com/music-lyric/music-lyric-player-web/commit/48b2fad))
  - change default annotation font sizes to em ([5d6071d](https://github.com/music-lyric/music-lyric-player-web/commit/5d6071d))
  - add font size unit option ([338e59d](https://github.com/music-lyric/music-lyric-player-web/commit/338e59d))
  - add per-word romanization ([0d68959](https://github.com/music-lyric/music-lyric-player-web/commit/0d68959))
  - make vocal line row order configurable ([f8ca6aa](https://github.com/music-lyric/music-lyric-player-web/commit/f8ca6aa))

### Refactor

- `dom`
  - regroup config ([edc3703](https://github.com/music-lyric/music-lyric-player-web/commit/edc3703))
  - inline unit into font size ([7545739](https://github.com/music-lyric/music-lyric-player-web/commit/7545739))
  - restructure normal line config under main ([90e3794](https://github.com/music-lyric/music-lyric-player-web/commit/90e3794))

## v0.15.0 (2026-06-23)

### Document

- add custom styling guide ([c8cc5e0](https://github.com/music-lyric/music-lyric-player-web/commit/c8cc5e0))
- `dom`
  - explain partial default config assertion ([d149cf3](https://github.com/music-lyric/music-lyric-player-web/commit/d149cf3))

### Feature

- bump lyric model version ([15ef889](https://github.com/music-lyric/music-lyric-player-web/commit/15ef889))
- `base`
  - add merge limit config ([eed9eee](https://github.com/music-lyric/music-lyric-player-web/commit/eed9eee))

### Refactor

- `base`
  - split core into collaborators ([642536f](https://github.com/music-lyric/music-lyric-player-web/commit/642536f))
- `dom`
  - centralize role and attribute constants ([c598dbc](https://github.com/music-lyric/music-lyric-player-web/commit/c598dbc))
  - rename instance attribute ([a012c06](https://github.com/music-lyric/music-lyric-player-web/commit/a012c06))
  - replace class-name with data-role ([23d5884](https://github.com/music-lyric/music-lyric-player-web/commit/23d5884))
  - split scroll animation into per mode options ([e08e932](https://github.com/music-lyric/music-lyric-player-web/commit/e08e932))
  - rename normal line extended to annotation ([fb1af97](https://github.com/music-lyric/music-lyric-player-web/commit/fb1af97))
  - rename normal line extended to annotation ([c9e93ad](https://github.com/music-lyric/music-lyric-player-web/commit/c9e93ad))

## v0.14.0 (2026-06-22)

### Document

- restructure readme ([6a5b326](https://github.com/music-lyric/music-lyric-player-web/commit/6a5b326))

### Feature

- `base`
  - merge close-ending lines to deactivate together ([385c47d](https://github.com/music-lyric/music-lyric-player-web/commit/385c47d))
- `dom`
  - expose line animation window as config ([b015171](https://github.com/music-lyric/music-lyric-player-web/commit/b015171))

### Performance

- `dom`
  - trim layout and mask hot-path overhead ([5d33cd3](https://github.com/music-lyric/music-lyric-player-web/commit/5d33cd3))
  - scope line will-change to the active window ([8c6da41](https://github.com/music-lyric/music-lyric-player-web/commit/8c6da41))

### Refactor

- `dom`
  - rename line animated flag to animatable ([270ba26](https://github.com/music-lyric/music-lyric-player-web/commit/270ba26))

## v0.13.0 (2026-06-20)

### Feature

- `dom`
  - add plain line ([e81ffd4](https://github.com/music-lyric/music-lyric-player-web/commit/e81ffd4))
  - amplify emphasize float on background lines ([e8c8c7f](https://github.com/music-lyric/music-lyric-player-web/commit/e8c8c7f))

### Fix

- `dom`
  - relayout and redrive line body on syllable enable toggle ([b03be0a](https://github.com/music-lyric/music-lyric-player-web/commit/b03be0a))

### Performance

- `dom`
  - promote emphasize scale to gpu layer via 3d transform ([de6fc95](https://github.com/music-lyric/music-lyric-player-web/commit/de6fc95))

### Refactor

- `dom`
  - split syllable glow easing into rise and fall ([17f607c](https://github.com/music-lyric/music-lyric-player-web/commit/17f607c))

## v0.12.1 (2026-06-19)

### Fix

- `dom`
  - disable pointer events on fully transparent played line ([0028f56](https://github.com/music-lyric/music-lyric-player-web/commit/0028f56))
  - add opacity transition for extended line ([87bdbb0](https://github.com/music-lyric/music-lyric-player-web/commit/87bdbb0))

## v0.12.0 (2026-06-12)

### Feature

- bump lyric model version ([f9796b8](https://github.com/music-lyric/music-lyric-player-web/commit/f9796b8))
- `base`
  - reject lyric updates with incompatible version ([3792073](https://github.com/music-lyric/music-lyric-player-web/commit/3792073))
  - convert content time to playback time with offset ([8e8f743](https://github.com/music-lyric/music-lyric-player-web/commit/8e8f743))
  - add offset support ([7a61a93](https://github.com/music-lyric/music-lyric-player-web/commit/7a61a93))
- `dom`
  - emit line context menu event on line right click ([e06e3d5](https://github.com/music-lyric/music-lyric-player-web/commit/e06e3d5))
  - emit line click event on line click ([7194d77](https://github.com/music-lyric/music-lyric-player-web/commit/7194d77))

### Refactor

- `base`
  - use global this instead of window for timers ([f1eef80](https://github.com/music-lyric/music-lyric-player-web/commit/f1eef80))
- `dom`
  - unify event names to camel case ([83e2c41](https://github.com/music-lyric/music-lyric-player-web/commit/83e2c41))
  - tighten spacing before background lines ([cc0993f](https://github.com/music-lyric/music-lyric-player-web/commit/cc0993f))
  - reimplement interlude dot animation with web animation api ([ddec1ed](https://github.com/music-lyric/music-lyric-player-web/commit/ddec1ed))

## v0.11.0 (2026-06-06)

### Document

- update note ([11938e7](https://github.com/music-lyric/music-lyric-player-web/commit/11938e7))

### Feature

- `dom`
  - add instance id getter to player ([2bdd855](https://github.com/music-lyric/music-lyric-player-web/commit/2bdd855))
- `utils`
  - add path-based get and set to config manager ([07a5fc6](https://github.com/music-lyric/music-lyric-player-web/commit/07a5fc6))

### Fix

- guard numeric inputs against invalid values ([701d221](https://github.com/music-lyric/music-lyric-player-web/commit/701d221))
- `base`
  - emit pause event only when playing ([ff1ccdc](https://github.com/music-lyric/music-lyric-player-web/commit/ff1ccdc))
- `dom`
  - clamp active index to prevent layout offset ([26a8282](https://github.com/music-lyric/music-lyric-player-web/commit/26a8282))
  - scope runtime styles per instance ([2a19044](https://github.com/music-lyric/music-lyric-player-web/commit/2a19044))
  - run line opacity and filter ahead of the position move ([0e124cf](https://github.com/music-lyric/music-lyric-player-web/commit/0e124cf))
  - align syllable brightness inside and outside the active line ([4b80709](https://github.com/music-lyric/music-lyric-player-web/commit/4b80709))
  - the syllable word flickering when reset ([c09dbe9](https://github.com/music-lyric/music-lyric-player-web/commit/c09dbe9))
  - keep lazily built animations paused at their initial frame ([320e8e7](https://github.com/music-lyric/music-lyric-player-web/commit/320e8e7))
- `utils`
  - isolate listener errors during emit ([210296f](https://github.com/music-lyric/music-lyric-player-web/commit/210296f))

### Performance

- `dom`
  - reuse element snapshot to avoid map lookup ([8c375b9](https://github.com/music-lyric/music-lyric-player-web/commit/8c375b9))
  - build syllable animations only within an active window ([bce3cea](https://github.com/music-lyric/music-lyric-player-web/commit/bce3cea))

### Refactor

- `dom`
  - remove unused config getter ([412d2ee](https://github.com/music-lyric/music-lyric-player-web/commit/412d2ee))
  - build all css var keys through shared helpers ([f2481dc](https://github.com/music-lyric/music-lyric-player-web/commit/f2481dc))

## v0.10.0 (2026-05-17)

### Feature

- `base`
  - add bridge active option to fill gaps between active lines ([9381ed3](https://github.com/music-lyric/music-lyric-player-web/commit/9381ed3))
- `dom`
  - export default config ([2ed1952](https://github.com/music-lyric/music-lyric-player-web/commit/2ed1952))
  - add emphasize animation for syllable line word ([57bf06f](https://github.com/music-lyric/music-lyric-player-web/commit/57bf06f))
- `main`
  - add full export ([4f31e5a](https://github.com/music-lyric/music-lyric-player-web/commit/4f31e5a))

### Fix

- `base`
  - correct default driver to animation ([2235a22](https://github.com/music-lyric/music-lyric-player-web/commit/2235a22))
- `dom`
  - use effect end for animation past end detection ([a3d80fb](https://github.com/music-lyric/music-lyric-player-web/commit/a3d80fb))
  - always play emphasize wind down on line switch ([fbbf723](https://github.com/music-lyric/music-lyric-player-web/commit/fbbf723))
  - block host line height inheritance on container ([980a4fe](https://github.com/music-lyric/music-lyric-player-web/commit/980a4fe))
  - dispose float animation before reinit in syllable word ([10a3f7e](https://github.com/music-lyric/music-lyric-player-web/commit/10a3f7e))

### Refactor

- format code ([e8dd2d9](https://github.com/music-lyric/music-lyric-player-web/commit/e8dd2d9))
- `base`
  - change config fields to partial ([c8fd5e4](https://github.com/music-lyric/music-lyric-player-web/commit/c8fd5e4))
  - split modules ([630e5f2](https://github.com/music-lyric/music-lyric-player-web/commit/630e5f2))
- `dom`
  - rename config namespace ([792200a](https://github.com/music-lyric/music-lyric-player-web/commit/792200a))
  - use dashes fields in styles ([fd11208](https://github.com/music-lyric/music-lyric-player-web/commit/fd11208))
  - flatten emphasize main offset and easing fields ([00c9c1d](https://github.com/music-lyric/music-lyric-player-web/commit/00c9c1d))
  - merge emphasize animation effects for syllable word ([a3d0067](https://github.com/music-lyric/music-lyric-player-web/commit/a3d0067))

## v0.9.0 (2026-05-16)

### Document

- update packages readme ([3076e0b](https://github.com/music-lyric/music-lyric-player-web/commit/3076e0b))

### Feature

- `dom`
  - support duet by alternating alignment on agent change ([2eb8a3b](https://github.com/music-lyric/music-lyric-player-web/commit/2eb8a3b))
  - defer background line pop on both enter and retract ([8deeaae](https://github.com/music-lyric/music-lyric-player-web/commit/8deeaae))

### Fix

- `dom`
  - runtime style does not apply during initialization ([327fc67](https://github.com/music-lyric/music-lyric-player-web/commit/327fc67))
  - pad float delay before line starts ([250b117](https://github.com/music-lyric/music-lyric-player-web/commit/250b117))

## v0.8.0 (2026-05-11)

### Feature

- `dom`
  - add word mask feather config for syllable line ([ef422f6](https://github.com/music-lyric/music-lyric-player-web/commit/ef422f6))

### Fix

- `dom`
  - play or pause not dispatched after mask rebuild ([7940ba4](https://github.com/music-lyric/music-lyric-player-web/commit/7940ba4))
  - syllable word mask animation not rebuild when update size ([9600c59](https://github.com/music-lyric/music-lyric-player-web/commit/9600c59))

### Performance

- `dom`
  - use document fragment to cache element when init syllable line words ([be8f965](https://github.com/music-lyric/music-lyric-player-web/commit/be8f965))
  - skip size recalc on non-font config changes ([f85ff15](https://github.com/music-lyric/music-lyric-player-web/commit/f85ff15))
  - dedupe scheduled layout updates ([762f1f0](https://github.com/music-lyric/music-lyric-player-web/commit/762f1f0))
  - reuse scratch buffers in mask animtion host ([62107ec](https://github.com/music-lyric/music-lyric-player-web/commit/62107ec))

### Refactor

- `dom`
  - extract word mask animation generation to common utils ([5dd03ad](https://github.com/music-lyric/music-lyric-player-web/commit/5dd03ad))
  - extract syllable line mode from normal line ([1f9fbcf](https://github.com/music-lyric/music-lyric-player-web/commit/1f9fbcf))

## v0.7.0 (2026-05-07)

### Feature

- `dom`
  - add hide config in interlude line normal style ([70c9f58](https://github.com/music-lyric/music-lyric-player-web/commit/70c9f58))
  - add config interface export ([fda7596](https://github.com/music-lyric/music-lyric-player-web/commit/fda7596))

### Fix

- `dom`
  - mask animation was not applied to syllable words ([f53365e](https://github.com/music-lyric/music-lyric-player-web/commit/f53365e))

### Refactor

- `dom`
  - move style component to style manager ([54e6239](https://github.com/music-lyric/music-lyric-player-web/commit/54e6239))
  - rename wrapper line to base line ([1253994](https://github.com/music-lyric/music-lyric-player-web/commit/1253994))
  - word space in syllable line ([255f925](https://github.com/music-lyric/music-lyric-player-web/commit/255f925))
  - optimize components code ([3e6f968](https://github.com/music-lyric/music-lyric-player-web/commit/3e6f968))
  - extract frame scheduler to utils ([da7ce86](https://github.com/music-lyric/music-lyric-player-web/commit/da7ce86))
  - root config export name ([8948c70](https://github.com/music-lyric/music-lyric-player-web/commit/8948c70))
  - extract container and style from root component ([671a626](https://github.com/music-lyric/music-lyric-player-web/commit/671a626))

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
- `utils`
  - config manager events ([0adf348](https://github.com/music-lyric/music-lyric-player-web/commit/0adf348))
  - event client ([9afbdc8](https://github.com/music-lyric/music-lyric-player-web/commit/9afbdc8))
