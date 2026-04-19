import { getSliderRatio, getClientX } from './utils'

export interface SliderOptions {
  wrapper: HTMLElement
  track: HTMLElement
  fill: HTMLElement
  thumb: HTMLElement
  onSeek: (ratio: number) => void
}

export interface SliderInstance {
  update: (ratio: number) => void
  isDragging: () => boolean
}

export const createSlider = ({ wrapper, track, fill, thumb, onSeek }: SliderOptions): SliderInstance => {
  let dragging = false

  const update = (ratio: number): void => {
    const pct = `${ratio * 100}%`
    fill.style.width = pct
    thumb.style.left = pct
  }

  const seek = (e: MouseEvent | TouchEvent): void => {
    onSeek(getSliderRatio(track, getClientX(e)))
  }

  const onStart = (e: MouseEvent | TouchEvent): void => {
    dragging = true
    wrapper.classList.add('dragging')
    seek(e)
  }

  const onMove = (e: MouseEvent | TouchEvent): void => {
    if (dragging) seek(e)
  }

  const onEnd = (): void => {
    if (!dragging) return
    dragging = false
    wrapper.classList.remove('dragging')
  }

  wrapper.addEventListener('mousedown', onStart)
  wrapper.addEventListener('touchstart', onStart, { passive: true })
  document.addEventListener('mousemove', onMove)
  document.addEventListener('touchmove', onMove, { passive: true })
  document.addEventListener('mouseup', onEnd)
  document.addEventListener('touchend', onEnd)

  return { update, isDragging: () => dragging }
}
