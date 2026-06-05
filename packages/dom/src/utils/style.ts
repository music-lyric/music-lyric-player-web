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
 * Build a line-scoped CSS custom property key under the `--lyric-player-` namespace, mirroring the scss `build-line-var`.
 * @example `('animation', '', 'duration')` -> `--lyric-player-line-animation-duration`
 */
export const buildLineVarKey = (module: string, sub?: string, suffix?: string) => {
  let name = `line-${module}`
  if (sub) {
    name += `-${sub}`
  }
  if (suffix) {
    name += `-${suffix}`
  }
  return `--lyric-player-${name}`
}
