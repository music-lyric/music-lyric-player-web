import type { ConfigManager, DeepRequired, NestedKeys } from '@music-lyric-player/utils'

import { freezeObjectDeep } from '@music-lyric-player/utils'

export interface Offset {
  /**
   * Global offset in ms, applied to every song.
   *
   * @default 0
   */
  global?: number
  /**
   * Whether to apply the offset carried by the lyric's own meta (`MetaType.Offset`).
   *
   * @default true
   */
  useMeta?: boolean
  /**
   * Whether loading a new lyric via `updateLyric` resets the temp offset (set via `updateTempOffset`) back to 0.
   *
   * @default true
   */
  resetTempOnLyricChange?: boolean
}

export interface Root {
  /**
   * Driver type for playback scheduling.
   * - `animation`: use requestAnimationFrame
   * - `timer`: use setTimeout
   *
   * @default 'animation'
   */
  driver?: 'timer' | 'animation'
  /**
   * Whether to bridge gaps between simultaneously active lines.
   *
   * Active lines may not be consecutive — a line in the middle could have already ended (`played`) while its neighbors are still active, producing a `[active, played, active]` pattern.
   *
   * Enabling this promotes the sandwiched lines back to active so the visual reads as one continuous `[active, active, active]` block.
   *
   * @default true
   */
  bridgeActive?: boolean
  /**
   * Lyric time offset settings.
   */
  offset?: Offset
}

/**
 * Fully‑resolved config in which every field is required, produced by deep‑requiring the user‑facing {@link Config}.
 */
export type RootRequired = DeepRequired<Root>

/**
 * All config keys
 */
export type RootKeys = NestedKeys<Root>

/**
 * Set of config key paths that changed since the previous value, as emitted by `ConfigManager.event['update']`.
 */
export type RootKeySet = Set<RootKeys>

/**
 * Runtime config manager bound to this module's {@link Config} shape.
 */
export type RootManager = ConfigManager<RootRequired, Root>

export const DEFAULT: Root = freezeObjectDeep({
  driver: 'animation',
  bridgeActive: true,
  offset: {
    global: 0,
    useMeta: true,
    resetTempOnLyricChange: true,
  },
})
