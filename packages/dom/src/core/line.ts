import type { Line } from '@music-lyric-kit/lyric'
import type { LineElement } from '@root/components'
import type { Context } from '@root/context'
import type { ConfigClient } from '@root/config'

import { LineType } from '@music-lyric-kit/lyric'
import { NormalLineElement, InterludeLineElement, Root } from '@root/components'

export class LineManager {
  private currentElementMap: Map<number, LineElement> = new Map()
  private currentIndexMap: Map<number, number[]> = new Map()

  constructor(
    private readonly context: Context,
    private readonly config: ConfigClient,
    private readonly root: Root,
  ) {}

  get elementMap(): ReadonlyMap<number, LineElement> {
    return this.currentElementMap
  }

  get elementSize() {
    return this.currentElementMap.size
  }

  get indexMap(): ReadonlyMap<number, number[]> {
    return this.currentIndexMap
  }

  isActiveElement(elemIndex: number, currentIndex: number[]): boolean {
    for (const lineIdx of currentIndex) {
      const elemIndices = this.currentIndexMap.get(lineIdx)
      if (elemIndices && elemIndices.includes(elemIndex)) {
        return true
      }
    }
    return false
  }

  queryElement(index: number): LineElement | undefined {
    return this.currentElementMap.get(index)
  }

  queryElementIndexs(lineIndex: number): number[] | undefined {
    return this.currentIndexMap.get(lineIndex)
  }

  updateLines(lines: Line[]) {
    const position = this.config.current.layout.align

    const newElemMap = new Map<number, LineElement>()
    const newIndexMap = new Map<number, number[]>()

    let lineIndex = 0
    let elemIndex = 0

    for (const line of lines) {
      const currentLineIndex = lineIndex
      const currentElemIndex = elemIndex
      const indices: number[] = []

      lineIndex++
      elemIndex++

      switch (line.type) {
        case LineType.Interlude: {
          const elem = new InterludeLineElement(this.context, line)
          elem.position = position
          newElemMap.set(currentElemIndex, elem)
          indices.push(currentElemIndex)
          break
        }
        case LineType.Normal: {
          const elem = new NormalLineElement(this.context, line, false)
          elem.position = position
          newElemMap.set(currentElemIndex, elem)
          indices.push(currentElemIndex)

          for (const background of line.background || []) {
            const bgElem = new NormalLineElement(this.context, background, true)
            bgElem.position = position
            newElemMap.set(elemIndex, bgElem)
            indices.push(elemIndex)
            elemIndex++
          }
          break
        }
      }

      newIndexMap.set(currentLineIndex, indices)
    }

    this.clear()

    for (const elem of newElemMap.values()) {
      this.root.appendChild(elem.element)
    }

    this.currentElementMap = newElemMap
    this.currentIndexMap = newIndexMap
  }

  updateConfig() {
    const position = this.config.current.layout.align
    for (const element of this.currentElementMap.values()) {
      element.position = position
      element.updateConfig()
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
  }

  destroy() {
    this.clear()
  }
}
