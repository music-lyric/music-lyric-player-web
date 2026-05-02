import type { Line } from '@music-lyric-kit/lyric'
import type { LineElement } from '@root/components'
import type { ConfigKeySet } from '@root/config'
import type { CoreContext } from './context'

import { LineType } from '@music-lyric-kit/lyric'
import { NormalLineElement, InterludeLineElement } from '@root/components'

export class LineManager {
  private currentElementMap: Map<number, LineElement> = new Map()
  private currentIndexMap: Map<number, number[]> = new Map()

  private cachedActiveLineIndexes: number[] = []
  private cachedActiveSet: ReadonlySet<number> = new Set()

  constructor(private readonly context: CoreContext) {}

  get elementMap(): ReadonlyMap<number, LineElement> {
    return this.currentElementMap
  }

  get elementSize() {
    return this.currentElementMap.size
  }

  get indexMap(): ReadonlyMap<number, number[]> {
    return this.currentIndexMap
  }

  isActiveElement(element: number, current: number[]): boolean {
    for (const lineIndex of current) {
      const indexes = this.currentIndexMap.get(lineIndex)
      if (indexes && indexes.includes(element)) {
        return true
      }
    }
    return false
  }

  queryActiveElementSet(lineIndexes: number[]): ReadonlySet<number> {
    const cachedKeys = this.cachedActiveLineIndexes
    if (cachedKeys.length === lineIndexes.length) {
      let same = true
      for (let i = 0; i < lineIndexes.length; i++) {
        if (lineIndexes[i] !== cachedKeys[i]) {
          same = false
          break
        }
      }
      if (same) {
        return this.cachedActiveSet
      }
    }

    const result = new Set<number>()

    for (const lineIndex of lineIndexes) {
      const indexes = this.currentIndexMap.get(lineIndex)
      if (!indexes) {
        continue
      }
      for (const index of indexes) {
        result.add(index)
      }
    }

    this.cachedActiveLineIndexes = lineIndexes.slice()
    this.cachedActiveSet = result
    return result
  }

  queryElement(index: number): LineElement | undefined {
    return this.currentElementMap.get(index)
  }

  queryElementIndexes(lineIndex: number): number[] | undefined {
    return this.currentIndexMap.get(lineIndex)
  }

  updateLines(lines: Line[]) {
    const { config, component } = this.context

    const position = config.current.layout.align

    const newElementMap = new Map<number, LineElement>()
    const newIndexMap = new Map<number, number[]>()

    let lineIndex = 0
    let elementIndex = 0

    for (const line of lines) {
      const currentLineIndex = lineIndex
      const currentElementIndex = elementIndex
      const indexes: number[] = []

      lineIndex++
      elementIndex++

      switch (line.type) {
        case LineType.Interlude: {
          const element = new InterludeLineElement(component.context, line)

          element.position = position

          newElementMap.set(currentElementIndex, element)
          indexes.push(currentElementIndex)

          break
        }

        case LineType.Normal: {
          const element = new NormalLineElement(component.context, line, false)

          element.position = position

          newElementMap.set(currentElementIndex, element)
          indexes.push(currentElementIndex)

          for (const background of line.background ?? []) {
            const backgroundElement = new NormalLineElement(component.context, background, true)

            backgroundElement.position = position

            newElementMap.set(elementIndex, backgroundElement)
            indexes.push(elementIndex)

            elementIndex++
          }

          break
        }
      }

      newIndexMap.set(currentLineIndex, indexes)
    }

    this.clear()

    for (const element of newElementMap.values()) {
      component.container.appendChild(element.element)
    }

    this.currentElementMap = newElementMap
    this.currentIndexMap = newIndexMap
  }

  updateConfig(keys?: ConfigKeySet) {
    const position = this.context.config.current.layout.align

    for (const element of this.currentElementMap.values()) {
      element.position = position
      element.updateConfig(keys)
    }
  }

  updateSize() {
    for (const element of this.currentElementMap.values()) {
      element.updateSize()
    }
  }

  clear() {
    for (const element of this.currentElementMap.values()) {
      element.destroy()
    }

    this.currentElementMap.clear()
    this.currentIndexMap.clear()

    this.cachedActiveLineIndexes = []
    this.cachedActiveSet = new Set()
  }

  destroy() {
    this.clear()
  }
}
