import type { StateStyleConfig } from '../common'

/**
 * Configuration for interlude (instrumental) lines.
 *
 * Rendered as a small indicator (e.g. dots) between vocal segments rather than
 * as text. Only the `normal` and `active` states are meaningful.
 */
export interface Root {
  /**
   * Extra CSS class appended to the interlude container.
   * @default ""
   */
  className?: string
  /**
   * Indicator size (e.g. dot diameter), in `px`.
   * @default 16
   */
  size?: number
  /**
   * State‑based style overrides.
   */
  style?: StateStyleConfig
}
