import { isPlainObject } from 'lodash-es'

export const compareObject = (prev: any, next: any, prefix = ''): string[] => {
  if (typeof prev !== 'object' || prev === null) {
    return []
  }
  if (typeof next !== 'object' || next === null) {
    return []
  }

  const changes: string[] = []

  const keys = new Set([...Object.keys(prev), ...Object.keys(next)])
  for (const key of keys) {
    const path = prefix ? `${prefix}.${key}` : key

    const a = prev[key]
    const b = next[key]

    if (a === b) {
      continue
    }

    if (isPlainObject(a) && isPlainObject(a)) {
      changes.push(...compareObject(a, b, path))
    } else {
      changes.push(path)
    }
  }

  return changes
}
