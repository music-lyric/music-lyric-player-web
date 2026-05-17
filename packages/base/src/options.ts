export interface Options {
  /**
   * Driver type for playback scheduling.
   * - `animation`: use requestAnimationFrame
   * - `timer`: use setTimeout
   *
   * @default 'animation'
   */
  driver: 'timer' | 'animation'
  /**
   * Whether to bridge gaps between simultaneously active lines.
   *
   * Active lines may not be consecutive — a line in the middle could have already ended (`played`) while its neighbors are still active, producing a `[active, played, active]` pattern.
   *
   * Enabling this promotes the sandwiched lines back to active so the visual reads as one continuous `[active, active, active]` block.
   *
   * @default true
   */
  bridgeActive: boolean
}

export const DEFAULT_OPTIONS: Options = {
  driver: 'animation',
  bridgeActive: true,
}
