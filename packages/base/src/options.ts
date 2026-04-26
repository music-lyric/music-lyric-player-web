export interface Options {
  /**
   * Driver type for playback scheduling.
   * - `animation`: use requestAnimationFrame
   * - `timer`: use setTimeout
   * @default animation
   */
  driver: 'timer' | 'animation'
}

export const DEFAULT_OPTIONS: Options = {
  driver: 'timer',
}
