import type { NestedKeys } from '@root/types'

import { Event } from '@root/event'

import { mergeObject, cloneObjectDeep, compareObject } from '@root/object'

export interface ConfigManagerEventMap<Full, Keys> {
  update: (changeKeys: Set<Keys>, config: Full) => void
  reset: (config: Full) => void
}

export class ConfigManager<Full, Init, Keys = NestedKeys<Full>> {
  readonly event = new Event<ConfigManagerEventMap<Full, Keys>>()

  private def: Full
  private now: Full

  constructor(def: Full, init?: Init) {
    this.def = def
    this.now = cloneObjectDeep(def)
    if (init) {
      this.now = mergeObject(this.now, init)
    }
  }

  update(target: Init) {
    if (!target) {
      return
    }

    const prev = this.now
    this.now = mergeObject(cloneObjectDeep(prev), target)

    const changed = compareObject(prev, this.now) as Set<Keys>
    if (changed.size) {
      this.event.emit('update', changed, this.now)
    }
  }

  reset() {
    const prev = cloneObjectDeep(this.now)
    this.now = cloneObjectDeep(this.def)

    const changed = compareObject(prev, this.now) as Set<Keys>
    if (changed.size) {
      this.event.emit('update', changed, this.now)
    }

    this.event.emit('reset', this.now)
  }

  get current() {
    return this.now
  }
}
