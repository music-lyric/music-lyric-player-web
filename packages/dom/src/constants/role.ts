export const PlayerRole = {
  root: 'root',
  container: 'container',
  line: {
    self: 'line',
    normal: {
      self: 'line-normal',
      text: {
        self: 'line-normal-text',
        word: {
          self: 'line-normal-text-word',
          char: 'line-normal-text-word-char',
        },
      },
      annotation: {
        self: 'line-normal-annotation',
        translation: 'line-normal-annotation-translation',
        romanization: 'line-normal-annotation-romanization',
      },
    },
    interlude: {
      self: 'line-interlude',
      dot: 'line-interlude-dot',
    },
  },
} as const
