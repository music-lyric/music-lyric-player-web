const kebabify = (str: string) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? '-' : '') + $.toLowerCase())

export const createCssText = (styles: Partial<CSSStyleDeclaration>) => {
  return Object.keys(styles)
    .map((key) => `${kebabify(key)}: ${styles[key as any]}`)
    .join(';')
}

export const applyClassName = (element: HTMLDivElement, names: string[]) => {
  for (const item of element.classList.values()) {
    element.classList.remove(item)
  }
  for (const name of names) {
    if (!name) {
      continue
    }
    if (!name.trim()) {
      continue
    }
    element.classList.add(name)
  }
}

/**
 * Stable `data-role` values that tag each player element.
 * They form a public CSS hook, meant to be combined with the instance scope and state attributes.
 * @example `[lyric-player-instance-id] [data-role="line"][active]`
 */
export const PlayerRole = {
  root: 'root',
  container: 'container',
  line: 'line',
  normal: 'normal',
  interlude: 'interlude',
  text: 'text',
  word: 'word',
  char: 'char',
  annotation: 'annotation',
  translation: 'translation',
  romanization: 'romanization',
  dot: 'dot',
} as const

/**
 * Tag an element with its stable `data-role`, the public CSS hook for targeting internal nodes.
 */
export const applyRole = (element: HTMLElement, role: string) => {
  element.setAttribute('data-role', role)
}

/**
 * Build a root-scoped player CSS custom property key under the `--lyric-player-` namespace.
 * @example `('container-width')` -> `--lyric-player-container-width`
 */
export const buildRootVariableKey = (target: string) => {
  return `--lyric-player-${target}`
}

/**
 * Build a line-scoped player CSS custom property key.
 * @example `('animation', '', 'duration')` -> `--lyric-player-line-animation-duration`
 */
export const buildLineVariableKey = (module: string, sub?: string, suffix?: string) => {
  let name = `line-${module}`
  if (sub) {
    name += `-${sub}`
  }
  if (suffix) {
    name += `-${suffix}`
  }
  return buildRootVariableKey(name)
}
