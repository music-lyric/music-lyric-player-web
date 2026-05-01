/**
 * Properties shared by every scroll animation mode.
 */
export interface Base {
  /**
   * Transition duration of **each individual line**, in `ms`.
   *
   * In cascade modes (Ripple / Directional / Stagger), the total visual
   * duration is roughly `duration + maxDelay`, where `maxDelay` is:
   * - Ripple / Directional: `range × step`
   * - Stagger:              `2 × range × step`
   *
   * @default 500
   */
  duration?: number
  /**
   * CSS easing function for the transition.
   *
   * @default "ease"
   * @example "ease-in-out"
   * @example "cubic-bezier(0.4, 0, 0.2, 1)"
   * @example "linear"
   */
  easing?: string
}

/**
 * Scroll animation mode.
 */
export enum Mode {
  /**
   * All lines move together — no cascade. An optional fixed `delay` may be added.
   */
  Smooth = 'smooth',
  /**
   * Symmetric cascade radiating outward from the active line.
   */
  Ripple = 'ripple',
  /**
   * Asymmetric cascade: played lines move first, upcoming lines follow.
   */
  Directional = 'directional',
  /**
   * Linear, direction‑sensitive stagger (legacy).
   * Delay formula: `(range + sign × clampedOffset) × step`.
   */
  Stagger = 'stagger',
}

/**
 * Uniform (non‑cascade) scroll animation.
 */
export interface Smooth extends Base {
  mode: Mode.Smooth
  /**
   * Fixed delay before the transition starts, in `ms`.
   * @default 0
   */
  delay?: number
}

/**
 * Symmetric cascade radiating outward from the active line.
 */
export interface Ripple extends Base {
  mode: Mode.Ripple
  /**
   * Offset (in line units) at which the per‑line delay saturates.
   * Lines with `|offset| ≥ range` all receive the maximum delay.
   *
   * @default 5
   * @minimum 1
   */
  range?: number
  /**
   * Delay increment per offset unit, in `ms`. Scales the cascade curve.
   *
   * @default 40
   * @minimum 10
   */
  step?: number
}

/**
 * Asymmetric cascade: played lines move first, upcoming lines follow.
 */
export interface Directional extends Base {
  mode: Mode.Directional
  /**
   * Offset (in line units) at which the per‑line delay saturates.
   *
   * @default 5
   * @minimum 1
   */
  range?: number
  /**
   * Delay increment per offset unit, in `ms`.
   *
   * @default 40
   * @minimum 10
   */
  step?: number
}

/**
 * Linear, direction‑sensitive stagger cascade (legacy).
 *
 * Delay formula:
 *   `delay = (range + sign × clampedOffset) × step`
 *
 * - Forward (`played = false`):  offset increases → delay grows.
 * - Backward (`played = true`):  trend reverses.
 *
 * Output is clamped to `[0, 2 × range × step]` and is always a multiple of `step`.
 */
export interface Stagger extends Base {
  mode: Mode.Stagger
  /**
   * Offset (in line units) at which the delay saturates.
   *
   * @default 4
   * @minimum 1
   */
  range?: number
  /**
   * Delay increment per offset unit, in `ms`.
   *
   * @default 50
   * @minimum 1
   */
  step?: number
}
