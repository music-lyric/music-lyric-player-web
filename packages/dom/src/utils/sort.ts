import { Slot } from '@root/config/line/normal'

export const DEFAULT_SORT: Slot[] = [Slot.AnnotationRoman, Slot.Main, Slot.AnnotationTranslate]

export const resolveSort = (sort: readonly Slot[] | undefined): Slot[] => {
  const seen = new Set<Slot>()
  const result: Slot[] = []
  for (const slot of sort ?? []) {
    if (DEFAULT_SORT.includes(slot) && !seen.has(slot)) {
      seen.add(slot)
      result.push(slot)
    }
  }
  for (const slot of DEFAULT_SORT) {
    if (!seen.has(slot)) {
      result.push(slot)
    }
  }
  return result
}
