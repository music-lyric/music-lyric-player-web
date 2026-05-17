export const formatTime = (seconds: number): string => {
  if (Number.isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const clamp = (value: number, min = 0, max = 1): number => Math.max(min, Math.min(max, value))

export const debounce = <T extends (...args: any[]) => void>(fn: T, delay = 300) => {
  let timer: number | null = null
  return (...args: Parameters<T>) => {
    if (timer != null) clearTimeout(timer)
    timer = window.setTimeout(() => fn(...args), delay)
  }
}

export const deepMerge = <T extends Record<string, any>>(target: T, source: any): T => {
  for (const key of Object.keys(source ?? {})) {
    if (source[key] === undefined) {
      delete (target as any)[key]
      continue
    }
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!(target as any)[key] || typeof (target as any)[key] !== 'object') {
        ;(target as any)[key] = {}
      }
      deepMerge((target as any)[key], source[key])
    } else {
      ;(target as any)[key] = source[key]
    }
  }
  return target
}

export const getByPath = (obj: any, path: string): any => {
  const parts = path.split('.')
  let cur = obj
  for (const part of parts) {
    if (cur == null) return undefined
    cur = cur[part]
  }
  return cur
}

const INHERIT_CHAIN: Array<[string, string]> = [
  ['dom.line.normal.extended.translate', 'dom.line.normal.extended.base'],
  ['dom.line.normal.extended.roman', 'dom.line.normal.extended.base'],
  ['dom.line.normal.extended.base', 'dom.line.normal.base'],
  ['dom.line.normal.syllable', 'dom.line.normal.base'],
]

const INHERITABLE_SUBPATHS = ['font.', 'style.']

const buildInheritedPaths = (path: string): string[] => {
  const chain = [path]
  let current = path
  while (true) {
    let next: string | undefined
    for (const [src, dst] of INHERIT_CHAIN) {
      const prefix = src + '.'
      if (!current.startsWith(prefix)) continue
      const suffix = current.slice(prefix.length)
      if (!INHERITABLE_SUBPATHS.some((s) => suffix.startsWith(s))) break
      next = dst + '.' + suffix
      break
    }
    if (next === undefined) break
    chain.push(next)
    current = next
  }
  return chain
}

export const resolveInheritedValue = (path: string, ...sources: any[]): any => {
  for (const p of buildInheritedPaths(path)) {
    for (const src of sources) {
      const v = getByPath(src, p)
      if (v !== undefined) return v
    }
  }
  return undefined
}

export const setByPath = (obj: any, path: string, value: any): void => {
  const parts = path.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i]
    if (cur[k] == null || typeof cur[k] !== 'object') {
      cur[k] = {}
    }
    cur = cur[k]
  }
  cur[parts[parts.length - 1]] = value
}

export const patchFromPath = (path: string, value: any): any => {
  const parts = path.split('.')
  const root: any = {}
  let cur = root
  for (let i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] = {}
    cur = cur[parts[i]]
  }
  cur[parts[parts.length - 1]] = value
  return root
}
