/**
 * Base transition properties shared by all scroll animation modes.
 */
interface WithTransition {
  /**
   * Transition duration for **each individual line**, in ms.
   * In cascade modes (Ripple / Directional) the total visual duration is
   * approximately `duration + range × step`.
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
   * Maximum number of lines affected by the cascade.
   * Lines beyond this range receive the same maximum delay.
   * @default 5
   * @minimum 1
   */
  range?: number
  /**
   * Base time interval between the delay of consecutive lines, in ms.
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
   * Maximum number of lines affected by the cascade.
   * Lines beyond this range receive the same maximum delay.
   * @default 5
   * @minimum 1
   */
  range?: number
  /**
   * Base time interval between the delay of consecutive lines, in ms.
   * @default 40
   * @minimum 10
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
   *
   * @default Smooth mode (duration 500ms, easing "ease", delay 0)
   */
  animation?: ScrollAnimationWithSmooth | ScrollAnimationWithRipple | ScrollAnimationWithDirectional
}
