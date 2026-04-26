/**
 * Base transition properties shared by all scroll animation modes.
 */
interface WithTransition {
  /**
   * Transition duration for **each individual line**, in ms.
   *
   * In cascade modes (Ripple / Directional / Stagger) the total visual duration
   * is approximately `duration + maxDelay`, where `maxDelay` depends on the mode:
   * - Ripple / Directional: `maxDelay ≈ range × step`
   * - Stagger:             `maxDelay = 2 × range × step`
   *
   * @default 500
   */
  duration?: number
  /**
   * CSS easing function for the transition.
   * @default "ease"
   * @example "ease-in-out"
   * @example "cubic-bezier(0.4, 0, 0.2, 1)"
   * @example "linear"
   */
  easing?: string
}

export enum ScrollAnimationMode {
  /**
   * Uniform transition: all lines move together. An optional fixed delay can be added.
   */
  Smooth = 'smooth',
  /**
   * Cascade from the active line outward, like a ripple.
   */
  Ripple = 'ripple',
  /**
   * Directional cascade: played lines move first, upcoming lines follow.
   */
  Directional = 'directional',
  /**
   * Linear, direction-sensitive stagger cascade (legacy behaviour).
   * Delay formula: `(range + sign × clampedOffset) × step`
   */
  Stagger = 'stagger',
}

/**
 * Smooth (non‑cascade) scroll animation configuration.
 */
export interface ScrollAnimationWithSmooth extends WithTransition {
  mode: ScrollAnimationMode.Smooth
  /**
   * Fixed delay before the transition starts, in ms.
   * @default 0
   */
  delay?: number
}

/**
 * Ripple scroll animation configuration (symmetrical cascade).
 */
export interface ScrollAnimationWithRipple extends WithTransition {
  mode: ScrollAnimationMode.Ripple
  /**
   * Absolute offset threshold (in line units) at which the delay saturates.
   * Lines whose `|offset| ≥ range` will receive the maximum delay.
   * @default 5
   * @minimum 1
   */
  range?: number
  /**
   * Delay increment per unit of offset, in milliseconds.
   * Acts as a scaling factor for the cascade curve.
   * @default 40
   * @minimum 10
   */
  step?: number
}

/**
 * Directional scroll animation configuration (asymmetric cascade).
 */
export interface ScrollAnimationWithDirectional extends WithTransition {
  mode: ScrollAnimationMode.Directional
  /**
   * Absolute offset threshold (in line units) at which the delay saturates.
   * Lines whose `|offset| ≥ range` will receive the maximum delay.
   * @default 5
   * @minimum 1
   */
  range?: number
  /**
   * Delay increment per unit of offset, in milliseconds.
   * Acts as a scaling factor for the cascade curve.
   * @default 40
   * @minimum 10
   */
  step?: number
}

/**
 * Stagger scroll animation configuration.
 *
 * Produces a linear, direction-sensitive delay across lines:
 *   delay = (range + sign × clampedOffset) × step
 *
 * - When direction is forward (played=false), offset increases → delay grows.
 * - When direction is backward (played=true), trend reverses.
 * - Output delay is clamped to [0, 2 × range × step] and is always a multiple of step.
 *
 * This exactly replicates the legacy "stagger" timing logic.
 */
export interface ScrollAnimationWithStagger extends WithTransition {
  mode: ScrollAnimationMode.Stagger
  /**
   * Absolute offset value (in line units) at which delay saturates.
   * Offsets with |offset| ≥ range will receive the maximum (or minimum) delay.
   * @default 4
   * @minimum 1
   */
  range?: number
  /**
   * Delay increment per unit of offset, in milliseconds.
   * Each step of offset changes the delay by this amount.
   * @default 50
   * @minimum 1
   */
  step?: number
}

/**
 * Viewport scrolling engine configuration.
 */
export interface ScrollConfig {
  /**
   * Vertical anchor position of the active line within the container,
   * expressed as a percentage (0–100) of the container height.
   * - `50` — active line stays at the vertical center.
   * - `30` — active line stays closer to the top.
   * @default 50
   */
  anchor?: number
  /**
   * Transition animation configuration for scroll‑triggered line movements.
   *
   * - **Smooth** — all lines move together with a uniform transition (no cascade).
   * - **Ripple** — active line moves first, nearby lines follow symmetrically outward.
   * - **Directional** — played lines move first, upcoming lines follow with directional propagation.
   * - **Stagger** — legacy linear stagger with direction sign, delay saturates at range.
   *
   * @default Smooth mode (duration 500ms, easing "ease", delay 0)
   */
  animation?: ScrollAnimationWithSmooth | ScrollAnimationWithRipple | ScrollAnimationWithDirectional | ScrollAnimationWithStagger
}
