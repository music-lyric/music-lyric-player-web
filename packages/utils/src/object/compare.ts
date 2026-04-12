import { isPlainObject } from 'lodash-es'

export const compareObject = (prev: any, next: any, prefix = ''): string[] => {
  if (typeof prev !== 'object' || prev === null) {
    return []
  }
  if (typeof next !== 'object' || next === null) {
    return []
  }

  const changes = new Set<string>()

  const keys = new Set([...Object.keys(prev), ...Object.keys(next)])
  for (const key of keys) {
    const path = prefix ? `${prefix}.${key}` : key

    const a = prev[key]
    const b = next[key]

    if (a === b) {
      continue
    }

    if (isPlainObject(a) && isPlainObject(b)) {
      const nextChanges = compareObject(a, b, path)
      if (nextChanges.length > 0) {
        changes.add(path)
        for (const change of nextChanges) {
          changes.add(change)
        }
      }
    } else {
      changes.add(path)
    }
  }

  return [...changes]
}
