export interface EffectScale {
  /**
   * Whether to enable the scale effect.
   * @default false
   */
  enabled?: boolean
  /**
   * Minimum scale ratio applied to the farthest lines.
   * @default 0.65
   */
  min?: number
  /**
   * Maximum scale ratio applied to the active line.
   * @default 1
   */
  max?: number
}

export interface EffectBlur {
  /**
   * Whether to enable the blur effect.
   * @default true
   */
  enabled?: boolean
  /**
   * Minimum blur amount (in px) for the active line — this is the clearest state.
   * @default 0.4
   */
  min?: number
  /**
   * Maximum blur amount (in px) for the farthest lines — this is the most blurred state.
   * @default 4.5
   */
  max?: number
}

export interface EffectConfig {
  /**
   * Scale transform effect configuration.
   */
  scale?: EffectScale
  /**
   * Blur effect configuration.
   * Lines closer to the active line are clearer; lines farther away become more blurred.
   */
  blur?: EffectBlur
}
