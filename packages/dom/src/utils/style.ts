const kebabify = (str: string) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? '-' : '') + $.toLowerCase())

export const createCssText = (styles: Partial<CSSStyleDeclaration>) => {
  return Object.keys(styles)
    .map((key) => `${kebabify(key)}: ${styles[key as any]}`)
    .join(';')
}

export const createStyleKey = (key: string) => {
  return `--lyric-player-${key}`
}

export const applyClassName = (element: HTMLDivElement, names: string[]) => {
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
