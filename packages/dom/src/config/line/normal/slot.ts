/**
 * Renderable rows of a vocal line, used by {@link Root.sort} to lay them out top‑to‑bottom.
 */
export enum Slot {
  /**
   * The main vocal line (syllable or plain text).
   */
  Main = 'main',
  /**
   * The translation annotation row.
   */
  AnnotationTranslate = 'annotation-translate',
  /**
   * The romanization annotation row.
   */
  AnnotationRoman = 'annotation-roman',
}
