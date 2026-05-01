/**
 * Geometric layout rules applied to all lyric lines.
 */
export interface Root {
  /**
   * Horizontal alignment of lines within the container.
   * @default "left"
   */
  align?: 'left' | 'center' | 'right'
  /**
   * Vertical spacing between adjacent lines, in `px`.
   * @default 30
   */
  gap?: number
}
