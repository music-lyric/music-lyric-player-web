export type PaddingValue = `${number}px`

export type Padding =
  /** all sides */
  | PaddingValue
  /** top/bottom | left/right */
  | `${PaddingValue} ${PaddingValue}`
  /** top | left/right | bottom */
  | `${PaddingValue} ${PaddingValue} ${PaddingValue}`
  /** top | right | bottom | left */
  | `${PaddingValue} ${PaddingValue} ${PaddingValue} ${PaddingValue}`

export interface FontConfig {
  /**
   * Font size in px.
   * @default 30
   */
  size?: number
  /**
   * Font weight (100–900).
   * @default 500
   */
  weight?: number
  /**
   * Font family name.
   * @default "sans-serif"
   * @example "'PingFang SC', 'Helvetica Neue', Arial, sans-serif"
   */
  family?: string
}

export interface StyleConfig {
  /**
   * Color value (any valid CSS color).
   * @default "#000000"
   * @example "rgba(255, 255, 255, 0.8)"
   * @example "#333333"
   */
  color?: string
  /**
   * Opacity level (0.0 – 1.0).
   * @default 1 (fully opaque)
   */
  opacity?: number
}

export interface StateStyleConfig {
  /**
   * Style for the inactive (normal) state.
   */
  normal?: StyleConfig
  /**
   * Style for the active state.
   * Falls back to `normal` if not provided.
   */
  active?: StyleConfig
}
