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

const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const loadState = (): StoredState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

const saveState = (state: StoredState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

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

document.addEventListener('DOMContentLoaded', () => {
  const audioChip = document.getElementById('audio-chip') as HTMLDivElement
  const lyricChip = document.getElementById('lyric-chip') as HTMLDivElement
  const audioInput = document.getElementById('audio-input') as HTMLInputElement
  const lyricInput = document.getElementById('lyric-input') as HTMLInputElement
  const audioName = document.getElementById('audio-name') as HTMLSpanElement
  const lyricName = document.getElementById('lyric-name') as HTMLSpanElement
  const lyricContainer = document.getElementById('lyric-container') as HTMLDivElement
  const emptyState = document.getElementById('empty-state') as HTMLDivElement
  const playBtn = document.getElementById('play-btn') as HTMLButtonElement
  // @ts-expect-error
  const playIcon = document.getElementById('play-icon') as SVGElement
  // @ts-expect-error
  const pauseIcon = document.getElementById('pause-icon') as SVGElement
  const progressWrapper = document.getElementById('progress-wrapper') as HTMLDivElement
  const progressTrack = document.getElementById('progress-track') as HTMLDivElement
  const progressFill = document.getElementById('progress-fill') as HTMLDivElement
  const progressThumb = document.getElementById('progress-thumb') as HTMLDivElement
  const timeDisplay = document.getElementById('time-display') as HTMLDivElement
  const volumeBtn = document.getElementById('volume-btn') as HTMLButtonElement
  // @ts-expect-error
  const volumeIcon = document.getElementById('volume-icon') as SVGElement
  // @ts-expect-error
  const volumeMutedIcon = document.getElementById('volume-muted-icon') as SVGElement
  const volumeSliderWrapper = document.getElementById('volume-slider-wrapper') as HTMLDivElement
  const volumeTrack = document.getElementById('volume-track') as HTMLDivElement
  const volumeFill = document.getElementById('volume-fill') as HTMLDivElement
  const volumeThumb = document.getElementById('volume-thumb') as HTMLDivElement
  const audio = document.getElementById('audio') as HTMLAudioElement

  const base = new BaseLyricPlayer()
  const dom = new DomLyricPlayer(base)
  let isPlaying = false
  let hasAudio = false
  let isDragging = false
  let isVolumeDragging = false
  let isMuted = false
  let volumeBeforeMute = 1
  let animationFrame: number | null = null

  const state = loadState()

  const updatePlayButton = (): void => {
    playBtn.disabled = !hasAudio
    playIcon.style.display = isPlaying ? 'none' : 'block'
    pauseIcon.style.display = isPlaying ? 'block' : 'none'
  }

  const updateProgressBar = (ratio?: number): void => {
    const r = ratio ?? (audio.duration ? audio.currentTime / audio.duration : 0)
    const pct = `${r * 100}%`
    progressFill.style.width = pct
    progressThumb.style.left = pct
  }

  const updateTimeDisplay = (): void => {
    const current = audio.currentTime || 0
    const duration = audio.duration || 0
    timeDisplay.textContent = `${formatTime(current)} / ${formatTime(duration)}`
    if (!isDragging) {
      updateProgressBar()
    }
  }

  const tick = (): void => {
    if (!isPlaying) return
    base.play(audio.currentTime * 1000)
    updateTimeDisplay()
    animationFrame = requestAnimationFrame(tick)
  }

  const parseLyric = (content: string): void => {
    let format: 'ttml-amll' | 'lrc' = 'ttml-amll'
    if (!content.includes('<tt') && !content.includes('<TTML')) {
      format = 'lrc'
    }

    const parser = new ParserPipeline({ content, format })
    const result = parser
      .parse()
      .pureClean()
      .pureExtract()
      .agentExtract()
      .backgroundExtract()
      .backgroundClean()
      .spaceInsert()
      .interludeInsert()
      .stressMark()
      .final()

    if (result) {
      base.updateLyric(result.result)
      emptyState.style.display = 'none'
    }
  }

  const mountPlayer = (): void => {
    if (!lyricContainer.contains(dom.element)) {
      lyricContainer.appendChild(dom.element)
      dom.element.style.width = '100%'
      dom.element.style.height = '100%'
    }
  }

  const setupAudioFile = (file: File | Blob, name: string): void => {
    const url = URL.createObjectURL(file)
    audio.src = url
    audioName.textContent = name
    audioName.classList.add('selected')
    hasAudio = true
    updatePlayButton()

    audio.addEventListener(
      'loadedmetadata',
      () => {
        updateTimeDisplay()
      },
      { once: true },
    )
  }

  const seekToPosition = (clientX: number): void => {
    if (!hasAudio || !audio.duration) return
    const rect = progressTrack.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    audio.currentTime = ratio * audio.duration
    updateProgressBar(ratio)
    updateTimeDisplay()
    base.play(audio.currentTime * 1000)
  }

  const updateVolumeUI = (vol: number): void => {
    const pct = `${vol * 100}%`
    volumeFill.style.width = pct
    volumeThumb.style.left = pct
    volumeIcon.style.display = vol === 0 ? 'none' : 'block'
    volumeMutedIcon.style.display = vol === 0 ? 'block' : 'none'
  }

  const setVolume = (vol: number): void => {
    const v = Math.max(0, Math.min(1, vol))
    audio.volume = v
    isMuted = v === 0
    updateVolumeUI(v)
    state.volume = v
    saveState(state)
  }

  const seekVolumePosition = (clientX: number): void => {
    const rect = volumeTrack.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    volumeBeforeMute = ratio > 0 ? ratio : volumeBeforeMute
    setVolume(ratio)
  }

  audioChip.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).tagName !== 'INPUT') {
      audioInput.click()
    }
  })

  lyricChip.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).tagName !== 'INPUT') {
      lyricInput.click()
    }
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
    lyricName.textContent = file.name
    lyricName.classList.add('selected')
    parseLyric(content)
    mountPlayer()

    state.lyricName = file.name
    state.lyricContent = content
    saveState(state)
  })

  playBtn.addEventListener('click', () => {
    if (!hasAudio) return

    if (isPlaying) {
      audio.pause()
      base.pause()
      isPlaying = false
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
        animationFrame = null
      }
    } else {
      audio.play()
      isPlaying = true
      tick()
    }
    updatePlayButton()
  })

  progressWrapper.addEventListener('mousedown', (e) => {
    if (!hasAudio || !audio.duration) return
    isDragging = true
    progressWrapper.classList.add('dragging')
    seekToPosition(e.clientX)
  })

  progressWrapper.addEventListener(
    'touchstart',
    (e) => {
      if (!hasAudio || !audio.duration) return
      isDragging = true
      progressWrapper.classList.add('dragging')
      seekToPosition(e.touches[0].clientX)
    },
    { passive: true },
  )

  volumeBtn.addEventListener('click', () => {
    if (isMuted) {
      setVolume(volumeBeforeMute || 1)
    } else {
      volumeBeforeMute = audio.volume || 1
      setVolume(0)
    }
  })

  volumeSliderWrapper.addEventListener('mousedown', (e) => {
    isVolumeDragging = true
    volumeSliderWrapper.classList.add('dragging')
    seekVolumePosition(e.clientX)
  })

  volumeSliderWrapper.addEventListener(
    'touchstart',
    (e) => {
      isVolumeDragging = true
      volumeSliderWrapper.classList.add('dragging')
      seekVolumePosition(e.touches[0].clientX)
    },
    { passive: true },
  )

  document.addEventListener('mousemove', (e) => {
    if (isDragging) seekToPosition(e.clientX)
    if (isVolumeDragging) seekVolumePosition(e.clientX)
  })

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false
      progressWrapper.classList.remove('dragging')
    }
    if (isVolumeDragging) {
      isVolumeDragging = false
      volumeSliderWrapper.classList.remove('dragging')
    }
  })

  document.addEventListener(
    'touchmove',
    (e) => {
      if (isDragging) seekToPosition(e.touches[0].clientX)
      if (isVolumeDragging) seekVolumePosition(e.touches[0].clientX)
    },
    { passive: true },
  )

  document.addEventListener('touchend', () => {
    if (isDragging) {
      isDragging = false
      progressWrapper.classList.remove('dragging')
    }
    if (isVolumeDragging) {
      isVolumeDragging = false
      volumeSliderWrapper.classList.remove('dragging')
    }
  })

  audio.addEventListener('ended', () => {
    isPlaying = false
    base.pause()
    updatePlayButton()
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }
  })

  if (state.lyricName && state.lyricContent) {
    lyricName.textContent = state.lyricName
    lyricName.classList.add('selected')
    parseLyric(state.lyricContent)
    mountPlayer()
  }

  if (state.audioName) {
    audioName.textContent = state.audioName
    audioName.classList.add('selected')
    loadAudioFromDB()
      .then((file) => {
        if (file) {
          setupAudioFile(file, state.audioName!)
        }
      })
      .catch(console.error)
  }

  updatePlayButton()
  updateTimeDisplay()

  const savedVolume = state.volume ?? 1
  audio.volume = savedVolume
  volumeBeforeMute = savedVolume > 0 ? savedVolume : 1
  isMuted = savedVolume === 0
  updateVolumeUI(savedVolume)
})
