import type { ConfigManager, DeepRequired, NestedKeys } from '@music-lyric-player/utils'

import * as Line from './line'
import * as Effect from './effect'
import * as Scroll from './scroll'
import * as Layout from './layout'
import * as Container from './container'

/**
 * Top‑level configuration of the lyric player.
 *
 * Every field is optional — values not provided fall back to `DEFAULT_CONFIG`.
 * The shape is split by concern; each domain lives in its own sub‑module.
 */
export interface Root {
  /**
   * Outer wrapper: class name, padding and edge fade.
   */
  container?: Container.Root

  /**
   * Geometric layout: alignment and inter‑line spacing.
   */
  layout?: Layout.Root

  /**
   * Visual effects (scale, blur) driven by distance from the active line.
   */
  effect?: Effect.Root

  /**
   * Viewport scrolling and transition animation.
   */
  scroll?: Scroll.Root

  /**
   * Lyric line rendering: vocal lines and interlude markers.
   */
  line?: Line.Root
}

/**
 * Fully‑resolved config in which every field is required,
 * produced by deep‑requiring the user‑facing {@link Config}.
 */
export type ConfigRequired = DeepRequired<Root>

/**
 * Runtime config manager bound to this module's {@link Config} shape.
 */
export type ConfigClient = ConfigManager<ConfigRequired, Root>

/**
 * All config keys
 */
export type ConfigKeys = NestedKeys<Root>

/**
 * Set of config key paths that changed since the previous value,
 * as emitted by `ConfigManager.event['update']`.
 *
 * Components consume this to decide which parts to refresh.
 */
export type ConfigKeySet = Set<ConfigKeys>

export { Line, Effect, Scroll, Layout, Container }
