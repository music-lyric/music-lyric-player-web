import { Lyric } from '@music-lyric-kit/lyric'

export interface DomLyricPlayerEventMap {
  /**
   * When a lyric line is clicked by the user.
   * @param line The clicked lyric line.
   * @param index The clicked line's index in the current lyric info.
   * @param event The original DOM mouse event.
   */
  lineClick: (line: Lyric.Line, index: number, event: MouseEvent) => void

  /**
   * When a lyric line is right-clicked by the user.
   * @param line The right-clicked lyric line.
   * @param index The right-clicked line's index in the current lyric info.
   * @param event The original DOM mouse event.
   */
  lineContextMenu: (line: Lyric.Line, index: number, event: MouseEvent) => void
}
