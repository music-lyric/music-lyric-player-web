import { ParserPipeline } from 'music-lyric-kit'
import { BaseLyricPlayer } from '@music-lyric-player/base'
import { DomLyricPlayer } from '@music-lyric-player/dom'

const STORAGE_KEY = 'lyric-player-state'
const DB_NAME = 'MusicLyricDB'
const STORE_NAME = 'media'

interface StoredState {
  audioName?: string
  lyricName?: string
  lyricContent?: string
  volume?: number
}

interface SliderOptions {
  wrapper: HTMLElement
  track: HTMLElement
  fill: HTMLElement
  thumb: HTMLElement
  onSeek: (ratio: number) => void
}

const $ = (id: string): HTMLElement => document.getElementById(id)!

const formatTime = (seconds: number): string => {
  if (Number.isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const clamp = (value: number, min = 0, max = 1): number => Math.max(min, Math.min(max, value))

const getSliderRatio = (track: HTMLElement, clientX: number): number => {
  const rect = track.getBoundingClientRect()
  return clamp((clientX - rect.left) / rect.width)
}

const getClientX = (e: MouseEvent | TouchEvent): number => ('touches' in e ? e.touches[0].clientX : e.clientX)

const toggleDisplay = (shown: HTMLElement, hidden: HTMLElement, condition: boolean): void => {
  shown.style.display = condition ? 'block' : 'none'
  hidden.style.display = condition ? 'none' : 'block'
}

const loadState = (): StoredState => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

const saveState = (state: StoredState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const openDB = async (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

const saveAudioToDB = async (file: File): Promise<void> => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(file, 'audioFile')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

const loadAudioFromDB = async (): Promise<File | undefined> => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get('audioFile')
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(tx.error)
  })
}

const createSlider = ({ wrapper, track, fill, thumb, onSeek }: SliderOptions) => {
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

const parseLyricContent = (content: string) => {
  const format = content.includes('<tt') || content.includes('<TTML') ? 'ttml-amll' : 'lrc'
  return new ParserPipeline({ content, format })
    .parse()
    .pureClean()
    .pureExtract()
    .agentExtract()
    .backgroundExtract()
    .backgroundClean()
    .spaceInsert()
    .stressMark()
    .final()
}

document.addEventListener('DOMContentLoaded', () => {
  const audioChip = $('audio-chip') as HTMLDivElement
  const lyricChip = $('lyric-chip') as HTMLDivElement
  const audioInput = $('audio-input') as HTMLInputElement
  const lyricInput = $('lyric-input') as HTMLInputElement
  const audioNameEl = $('audio-name') as HTMLSpanElement
  const lyricNameEl = $('lyric-name') as HTMLSpanElement
  const lyricContainer = $('lyric-container') as HTMLDivElement
  const emptyState = $('empty-state') as HTMLDivElement
  const playBtn = $('play-btn') as HTMLButtonElement
  const playIcon = $('play-icon')
  const pauseIcon = $('pause-icon')
  const timeDisplay = $('time-display') as HTMLDivElement
  const volumeBtn = $('volume-btn') as HTMLButtonElement
  const volumeIcon = $('volume-icon')
  const volumeMutedIcon = $('volume-muted-icon')
  const audio = $('audio') as HTMLAudioElement

  const base = new BaseLyricPlayer()
  const dom = new DomLyricPlayer(base)

  const state = loadState()
  let isPlaying = false
  let hasAudio = false
  let isMuted = false
  let volumeBeforeMute = 1
  let animationFrame: number | null = null

  const progress = createSlider({
    wrapper: $('progress-wrapper') as HTMLDivElement,
    track: $('progress-track') as HTMLDivElement,
    fill: $('progress-fill') as HTMLDivElement,
    thumb: $('progress-thumb') as HTMLDivElement,
    onSeek: (ratio) => {
      if (!hasAudio || !audio.duration) return
      audio.currentTime = ratio * audio.duration
      progress.update(ratio)
      updateTimeDisplay()
      base.play(audio.currentTime * 1000)
    },
  })

  const volume = createSlider({
    wrapper: $('volume-slider-wrapper') as HTMLDivElement,
    track: $('volume-track') as HTMLDivElement,
    fill: $('volume-fill') as HTMLDivElement,
    thumb: $('volume-thumb') as HTMLDivElement,
    onSeek: (ratio) => {
      if (ratio > 0) volumeBeforeMute = ratio
      setVolume(ratio)
    },
  })

  const updatePlayButton = (): void => {
    playBtn.disabled = !hasAudio
    toggleDisplay(pauseIcon, playIcon, isPlaying)
  }

  const updateTimeDisplay = (): void => {
    timeDisplay.textContent = `${formatTime(audio.currentTime || 0)} / ${formatTime(audio.duration || 0)}`
    if (!progress.isDragging()) {
      progress.update(audio.duration ? audio.currentTime / audio.duration : 0)
    }
  }

  const setVolume = (val: number): void => {
    const v = clamp(val)
    audio.volume = v
    isMuted = v === 0
    volume.update(v)
    toggleDisplay(volumeMutedIcon, volumeIcon, v === 0)
    state.volume = v
    saveState(state)
  }

  const tick = (): void => {
    if (!isPlaying) return
    updateTimeDisplay()
    animationFrame = requestAnimationFrame(tick)
  }

  const stopAnimation = (): void => {
    if (animationFrame != null) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }
  }

  const togglePlayback = (): void => {
    if (!hasAudio) return

    if (isPlaying) {
      audio.pause()
      base.pause()
      isPlaying = false
      stopAnimation()
    } else {
      audio.play()
      base.play(audio.currentTime * 1000)
      isPlaying = true
      tick()
    }
    updatePlayButton()
  }

  const setupAudioFile = (file: File | Blob, name: string): void => {
    audio.src = URL.createObjectURL(file)
    audioNameEl.textContent = name
    audioNameEl.classList.add('selected')
    hasAudio = true
    updatePlayButton()
    audio.addEventListener('loadedmetadata', updateTimeDisplay, { once: true })
  }

  const mountPlayer = (): void => {
    if (lyricContainer.contains(dom.element)) return
    lyricContainer.appendChild(dom.element)
    dom.element.style.width = '100%'
    dom.element.style.height = '100%'
  }

  const loadLyric = (content: string): void => {
    const result = parseLyricContent(content)
    if (result) {
      base.updateLyric(result.result)
      emptyState.style.display = 'none'
    }
  }

  const markFileSelected = (el: HTMLSpanElement, name: string): void => {
    el.textContent = name
    el.classList.add('selected')
  }

  audioChip.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).tagName !== 'INPUT') audioInput.click()
  })

  lyricChip.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).tagName !== 'INPUT') lyricInput.click()
  })

  audioInput.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    setupAudioFile(file, file.name)
    state.audioName = file.name
    saveState(state)
    await saveAudioToDB(file)
  })

  lyricInput.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const content = await file.text()
    markFileSelected(lyricNameEl, file.name)
    loadLyric(content)
    mountPlayer()
    state.lyricName = file.name
    state.lyricContent = content
    saveState(state)
  })

  playBtn.addEventListener('click', togglePlayback)

  volumeBtn.addEventListener('click', () => {
    if (isMuted) {
      setVolume(volumeBeforeMute || 1)
    } else {
      volumeBeforeMute = audio.volume || 1
      setVolume(0)
    }
  })

  audio.addEventListener('ended', () => {
    isPlaying = false
    base.pause()
    updatePlayButton()
    stopAnimation()
  })

  if (state.lyricName && state.lyricContent) {
    markFileSelected(lyricNameEl, state.lyricName)
    loadLyric(state.lyricContent)
    mountPlayer()
  }

  if (state.audioName) {
    markFileSelected(audioNameEl, state.audioName)
    loadAudioFromDB()
      .then((file) => {
        if (file) setupAudioFile(file, state.audioName!)
      })
      .catch(console.error)
  }

  const savedVolume = state.volume ?? 1
  audio.volume = savedVolume
  volumeBeforeMute = savedVolume > 0 ? savedVolume : 1
  isMuted = savedVolume === 0
  volume.update(savedVolume)
  toggleDisplay(volumeMutedIcon, volumeIcon, savedVolume === 0)

  updatePlayButton()
  updateTimeDisplay()
})
