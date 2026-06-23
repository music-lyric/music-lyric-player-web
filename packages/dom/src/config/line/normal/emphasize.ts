/**
 * The core per‑character emphasize transform: a scale pulse plus a small outward fan‑out
 * and upward lift. This is the "body" of the effect — glow and float are layered on top.
 */
export interface SyllableEmphasizeAnimationMain {
  /**
   * Whether the main transform animation runs.
   * @default true
   */
  enabled?: boolean
  /**
   * Peak scale increment. The character's final scale at the easing peak is
   * `1 + scale * intensity`, where `intensity` is derived from the syllable's duration.
   * @default 0.1
   * @min 0
   */
  scale?: number
  /**
   * Peak outward horizontal shift per character, in `px`. Characters fan outward from
   * the word's center; the center character does not move.
   * @default 1
   * @min 0
   */
  offsetHorizontal?: number
  /**
   * Peak upward vertical shift, in `px`. Applied uniformly to every character.
   * @default 1
   * @min 0
   */
  offsetVertical?: number
  /**
   * CSS easing applied from offset `0` to the peak at `0.5`.
   * @default "cubic-bezier(0.2, 0.4, 0.58, 1)"
   */
  easingRise?: string
  /**
   * CSS easing applied from the peak at `0.5` back to rest at `1`.
   * @default "cubic-bezier(0.3, 0, 0.58, 1)"
   */
  easingFall?: string
}

/**
 * Glow halo rendered behind emphasized characters.
 *
 * Implemented with `text-shadow`, which can't be promoted to a compositor layer and
 * therefore triggers a repaint each animated frame — that's why the glow is the only
 * sub‑effect that defaults to **off**. Enable it for richer visuals; disable on low‑end
 * devices for a paint‑free fallback.
 */
export interface SyllableEmphasizeAnimationGlow {
  /**
   * Whether to render the glow.
   * @default false
   */
  enabled?: boolean
  /**
   * Glow color, accepting any CSS color string parseable by the project's color parser
   * (`#rrggbb` / `#rgb` / `rgb(...)` / `rgba(...)`). When the string cannot be parsed the
   * glow is silently disabled — so setting an empty string is a soft kill switch.
   * @default "#000000"
   */
  color?: string
  /**
   * CSS easing applied from offset `0` to the peak at `0.5`.
   * @default "cubic-bezier(0.2, 0.4, 0.58, 1)"
   */
  easingRise?: string
  /**
   * CSS easing applied from the peak at `0.5` back to rest at `1`.
   * @default "cubic-bezier(0.3, 0, 0.58, 1)"
   */
  easingFall?: string
  /**
   * Maximum glow radius, in `px`. The runtime additionally clamps the radius by the
   * duration‑derived intensity so very short syllables get a tighter halo.
   * @default 9
   * @min 0
   */
  maxRadius?: number
  /**
   * Peak glow alpha in the `[0, 1]` range.
   * @default 1
   * @min 0
   * @max 1
   */
  maxAlpha?: number
}

/**
 * Timing controls for the secondary float layer.
 */
export interface SyllableEmphasizeAnimationFloatDuration {
  /**
   * Float duration as a multiple of the main emphasize duration. Values > 1 make the
   * float linger after the main effect has settled.
   * @default 1.4
   * @min 0
   */
  scale?: number
  /**
   * Number of milliseconds the float starts before the main emphasize effect.
   * @default 400
   * @min 0
   */
  lead?: number
}

/**
 * Amplified float for background lines, layered on the emphasize float.
 */
export interface SyllableEmphasizeAnimationFloatBackground {
  /**
   * Whether background lines get an amplified float.
   * @default true
   */
  enabled?: boolean
  /**
   * Float amplitude multiplier applied on background lines.
   * @default 2
   * @min 0
   */
  scale?: number
}

/**
 * Secondary sine‑wave float layered on top of the per‑word float animation.
 *
 * Stacks via `composite: add`, so it adds to — rather than replaces — the outer float.
 */
export interface SyllableEmphasizeAnimationFloat {
  /**
   * Whether to enable the secondary float.
   * @default true
   */
  enabled?: boolean
  /**
   * Float timing. See {@link SyllableEmphasizeAnimationFloatDuration}.
   */
  duration?: SyllableEmphasizeAnimationFloatDuration
  /**
   * Peak upward displacement, in `px`.
   * @default 2
   * @min 0
   */
  amplitude?: number
  /**
   * CSS easing applied to each half of the sine‑wave approximation.
   * @default "cubic-bezier(0.45, 0, 0.55, 1)"
   */
  easing?: string
  /**
   * Amplified float for background lines. See {@link SyllableEmphasizeAnimationFloatBackground}.
   */
  background?: SyllableEmphasizeAnimationFloatBackground
}

/**
 * Collection of the independently togglable sub‑effects that together compose the
 * emphasize animation. Each can be enabled or disabled in isolation; the per‑character
 * DOM split happens as long as at least one is on.
 */
export interface SyllableEmphasizeAnimationEffects {
  /**
   * Main per‑character transform. See {@link SyllableEmphasizeAnimationMain}.
   */
  main?: SyllableEmphasizeAnimationMain
  /**
   * Glow halo. See {@link SyllableEmphasizeAnimationGlow}.
   */
  glow?: SyllableEmphasizeAnimationGlow
  /**
   * Secondary float layer. See {@link SyllableEmphasizeAnimationFloat}.
   */
  float?: SyllableEmphasizeAnimationFloat
}

/**
 * Apple‑Music‑style emphasize effect for stressed syllables.
 *
 * Each character of a stress word is split into its own span and animated with up to
 * three independent sub‑effects (main transform, glow halo, secondary float). Every
 * sub‑effect can be toggled on or off independently — at least one must be enabled for
 * the per‑character DOM split to happen.
 */
export interface SyllableEmphasizeAnimation {
  /**
   * Master switch for the entire emphasize feature.
   * @default true
   */
  enabled?: boolean
  /**
   * Sub‑effects. See {@link SyllableEmphasizeAnimationEffects}.
   */
  effects?: SyllableEmphasizeAnimationEffects
  /**
   * Minimum animation duration in milliseconds. Syllables shorter than this still
   * emphasize but their animation timeline lasts at least this long.
   * @default 1000
   * @min 0
   */
  minDuration?: number
  /**
   * Playback rate used to wind down any per-character animation that is still in flight
   * when the line transitions out of the active state (i.e. the lyric line being sung
   * has moved on). Higher values finish the residual peak / glow faster so the visual
   * doesn't drag into the next line.
   * @default 4
   * @min 1
   */
  disablePlaybackRate?: number
}
