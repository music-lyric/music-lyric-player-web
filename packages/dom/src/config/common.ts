/**
 * A pixel value used inside a {@link Padding} shorthand, e.g. `"20px"`.
 */
export type PaddingValue = `${number}px`

/**
 * CSS‑like padding shorthand, restricted to `px` units.
 *
 * Mirrors the standard CSS `padding` shorthand:
 * - 1 value : all four sides
 * - 2 values: top/bottom · left/right
 * - 3 values: top · left/right · bottom
 * - 4 values: top · right · bottom · left
 */
export type Padding =
  | PaddingValue
  | `${PaddingValue} ${PaddingValue}`
  | `${PaddingValue} ${PaddingValue} ${PaddingValue}`
  | `${PaddingValue} ${PaddingValue} ${PaddingValue} ${PaddingValue}`

/**
 * Font appearance shared by lyric lines and their extended sub‑lines.
 */
export interface FontConfig {
  /**
   * Font size in `px`.
   * @default 30
   */
  size?: number
  /**
   * Font weight (`100`–`900`).
   * @default 500
   */
  weight?: number
  /**
   * CSS `font-family` value.
   * @default "sans-serif"
   * @example "'PingFang SC', 'Helvetica Neue', Arial, sans-serif"
   */
  family?: string
}

/**
 * Visual style for a single render state.
 */
export interface StyleConfig {
  /**
   * Any valid CSS color value.
   * @default "#000000"
   * @example "rgba(255, 255, 255, 0.8)"
   * @example "#333333"
   */
  color?: string
  /**
   * Opacity in the `[0, 1]` range; `1` is fully opaque.
   * @default 1
   */
  opacity?: number
}

/**
 * Style overrides keyed by playback state.
 *
 * `active` is the line currently being sung, `normal` is everything else.
 * Any state left unset falls back to `normal`.
 */
export interface StateStyleConfig {
  /**
   * Style of inactive (idle) lines.
   */
  normal?: StyleConfig
  /**
   * Style of the active line.
   * Falls back to `normal` if omitted.
   */
  active?: StyleConfig
}
