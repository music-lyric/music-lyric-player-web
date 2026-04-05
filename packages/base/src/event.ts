import { Info, Line } from '@music-lyric-kit/lyric'

export interface BaseLyricPlayerEventMap {
  'lyric-update': (info: Info) => void
  'lines-update': (lines: Line[]) => void
}

export class BaseLyricPlayerEvent {
  private listeners: {
    [K in keyof BaseLyricPlayerEventMap]?: Array<BaseLyricPlayerEventMap[K]>
  } = {}

  addEventListener<K extends keyof BaseLyricPlayerEventMap>(event: K, listener: BaseLyricPlayerEventMap[K]): void {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event]!.push(listener)
  }

  removeEventListener<K extends keyof BaseLyricPlayerEventMap>(event: K, listener: BaseLyricPlayerEventMap[K]): void {
    const callbacks = this.listeners[event]
    if (!callbacks) {
      return
    }

    const index = callbacks.indexOf(listener)
    if (index !== -1) {
      callbacks.splice(index, 1)
    }
  }

  protected handleEmitEvent<K extends keyof BaseLyricPlayerEventMap>(event: K, ...args: Parameters<BaseLyricPlayerEventMap[K]>): void {
    const callbacks = this.listeners[event]
    if (!callbacks?.length) {
      return
    }

    for (const callback of [...callbacks]) {
      // @ts-expect-error
      callback(...args)
    }
  }

  protected handleClearEvent() {
    this.listeners = {}
  }
}
