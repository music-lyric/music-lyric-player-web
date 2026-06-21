# @music-lyric-player/playground

Private Vue 3 + Vite app used to develop, demo, and tweak the player against real audio and lyric data.

## Run

From the repository root:

```shell
pnpm install
pnpm run dev
```

## What's in it

- **Audio tab** — pick a local audio file. The file is persisted in IndexedDB so it survives reloads
- **Lyric tab** — paste LRC (original / romanization / translation) or TTML, choose a TTML file, and tweak every step of the parser pipeline (`pureClean`, `agentExtract`, `backgroundExtract`, `interludeInsert`, `spaceInsert`, `stressMark`, …) with auto re-apply on change
- **Settings tab** — live editor for the DOM player config (layout, scroll animation, effects, line styles, syllable / extended / interlude rendering). Auto-saves to `localStorage`
- **Progress slider** — drag to preview lyric position; audio commits on release
- **i18n** — `en-us` / `zh-cn` switcher in the sidebar header
