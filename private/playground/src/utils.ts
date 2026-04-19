export const $ = (id: string): HTMLElement => document.getElementById(id)!

export const formatTime = (seconds: number): string => {
  if (Number.isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const clamp = (value: number, min = 0, max = 1): number => Math.max(min, Math.min(max, value))

export const getSliderRatio = (track: HTMLElement, clientX: number): number => {
  const rect = track.getBoundingClientRect()
  return clamp((clientX - rect.left) / rect.width)
}

export const getClientX = (e: MouseEvent | TouchEvent): number => ('touches' in e ? e.touches[0].clientX : e.clientX)

export const toggleDisplay = (shown: HTMLElement, hidden: HTMLElement, condition: boolean): void => {
  shown.style.display = condition ? 'block' : 'none'
  hidden.style.display = condition ? 'none' : 'block'
}

export const debounce = <T extends (...args: any[]) => void>(fn: T, delay = 300) => {
  let timer: number | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = window.setTimeout(() => fn(...args), delay)
  }
}

export const deepMerge = (target: any, source: any): any => {
  for (const key of Object.keys(source)) {
    if (source[key] === undefined) {
      delete target[key]
      continue
    }
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {}
      }
      deepMerge(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}
