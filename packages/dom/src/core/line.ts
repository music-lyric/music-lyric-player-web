import type { LineElement } from '@root/components'
import type { DomLyricPlayerConfig } from '@root/config'
import type { CoreContext } from './context'

import { Lyric } from '@music-lyric-kit/lyric'
import { hasKeyContaining } from '@music-lyric-player/utils'
import { NormalLineElement, InterludeLineElement, LineElementType } from '@root/components'

export class LineManager {
  private currentElementMap: Map<number, LineElement> = new Map()
  private currentIndexMap: Map<number, number[]> = new Map()

  // Insertion-ordered snapshot of `currentElementMap`, rebuilt only on membership change so layout can index it without re-materializing the map each pass.
  private currentElementList: LineElement[] = []

  private cachedActiveLineIndexes: number[] = []
  private cachedActiveSet: ReadonlySet<number> = new Set()

  constructor(private readonly context: CoreContext) {}

  get elementMap(): ReadonlyMap<number, LineElement> {
    return this.currentElementMap
  }

  get elementList(): readonly LineElement[] {
    return this.currentElementList
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

  updateLines(info: Lyric.Info) {
    const { component } = this.context

    const isSyllable = info.type === Lyric.InfoType.Syllable

    const newElementMap = new Map<number, LineElement>()
    const newIndexMap = new Map<number, number[]>()

    let lineIndex = 0
    let elementIndex = 0

    for (const line of info.lines) {
      const currentLineIndex = lineIndex
      const currentElementIndex = elementIndex
      const indexes: number[] = []

      lineIndex++
      elementIndex++

      switch (line.type) {
        case Lyric.LineType.Interlude: {
          const element = new InterludeLineElement(component.context, line)
          newElementMap.set(currentElementIndex, element)
          indexes.push(currentElementIndex)
          break
        }

        case Lyric.LineType.Normal: {
          const element = new NormalLineElement(component.context, line, false, isSyllable)
          element.index = currentLineIndex
          newElementMap.set(currentElementIndex, element)
          indexes.push(currentElementIndex)

          for (const background of line.background ?? []) {
            const backgroundElement = new NormalLineElement(component.context, background, true, isSyllable)
            backgroundElement.index = currentLineIndex
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
    this.currentElementList = Array.from(newElementMap.values())

    this.updateAlign()
  }

  updateAlign() {
    const { layout } = this.context.config.current

    const align = layout.align
    if (!layout.duet.enabled) {
      for (const element of this.currentElementMap.values()) {
        element.position = align
      }
      return
    }

    let current: DomLyricPlayerConfig.Layout.AlignValue = align
    let lastId: string | undefined = undefined
    for (const element of this.currentElementMap.values()) {
      if (element.type === LineElementType.Interlude) {
        element.position = align
        continue
      }

      if (!element.isBackground) {
        const agentId = element.info.agent?.id
        if (agentId !== undefined) {
          if (lastId !== undefined && agentId !== lastId) {
            current = current === 'left' ? 'right' : current === 'right' ? 'left' : current
          }
          lastId = agentId
        }
      }

      element.position = current
    }
  }

  updateConfig(keys?: DomLyricPlayerConfig.RootKeySet) {
    if (keys && (hasKeyContaining(keys, 'layout.align') || hasKeyContaining(keys, 'layout.duet'))) {
      this.updateAlign()
    }
    for (const element of this.currentElementMap.values()) {
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
    this.currentElementList = []

    this.cachedActiveLineIndexes = []
    this.cachedActiveSet = new Set()
  }

  destroy() {
    this.clear()
  }
}
