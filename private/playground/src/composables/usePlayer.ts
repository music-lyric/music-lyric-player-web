import type { Config } from '@music-lyric-player/dom'
import type { StoredLyric } from '@root/core/storage'

import { Lyric } from 'music-lyric-kit'
import { BaseLyricPlayer } from '@music-lyric-player/base'
import { DomLyricPlayer } from '@music-lyric-player/dom'

import { ref, shallowRef, onMounted, onUnmounted } from 'vue'
import { parseStoredLyric } from '@root/core/parser'
import { loadState, saveState, loadSettings, loadAudioFromDB, saveAudioToDB } from '@root/core/storage'
import { deepMerge } from '@root/utils'

interface UsePlayerOptions {
  defaults: Partial<Config.Root>
}

export const usePlayer = ({ defaults }: UsePlayerOptions) => {
  const base = new BaseLyricPlayer()
  const dom = new DomLyricPlayer(base)

  const savedSettings = loadSettings()
  const merged = deepMerge(deepMerge({}, defaults), savedSettings)
  dom.config.update(merged)

  const audio = new Audio()
  audio.style.display = 'none'

  const persisted = loadState()

  const isPlaying = ref(false)
  const hasAudio = ref(false)
  const hasLyric = ref(false)
  const audioName = ref<string>(persisted.audioName ?? '')
  const lyricInfo = ref<StoredLyric | undefined>(persisted.lyric)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(persisted.volume ?? 1)
  const muted = ref(volume.value === 0)

  let volumeBeforeMute = volume.value > 0 ? volume.value : 1
  let frameId: number | null = null

  audio.volume = volume.value

  const lyricElement = shallowRef<HTMLElement>(dom.element)

  const tick = () => {
    if (!isPlaying.value) return
    currentTime.value = audio.currentTime
    frameId = requestAnimationFrame(tick)
  }
  const stopTick = () => {
    if (frameId != null) {
      cancelAnimationFrame(frameId)
      frameId = null
    }
  }

  const persistState = () => {
    saveState({
      audioName: audioName.value || undefined,
      lyric: lyricInfo.value,
      volume: volume.value,
    })
  }

  const loadAudioFile = async (file: File | Blob, name: string) => {
    audio.src = URL.createObjectURL(file)
    audioName.value = name
    hasAudio.value = true
    return new Promise<void>((resolve) => {
      const onLoaded = () => {
        duration.value = audio.duration || 0
        audio.removeEventListener('loadedmetadata', onLoaded)
        resolve()
      }
      audio.addEventListener('loadedmetadata', onLoaded)
    })
  }

  const setAudioFromUser = async (file: File) => {
    await loadAudioFile(file, file.name)
    persistState()
    await saveAudioToDB(file)
  }

  const applyLyric = (stored: StoredLyric) => {
    const result = parseStoredLyric(stored)
    if (!result) return false
    base.updateLyric(result.result)
    hasLyric.value = true
    lyricInfo.value = stored
    persistState()
    return true
  }

  const clearLyric = () => {
    base.updateLyric(new Lyric.Info())
    hasLyric.value = false
    lyricInfo.value = undefined
    persistState()
  }

  const play = () => {
    if (!hasAudio.value) return
    audio.play()
    base.play(audio.currentTime * 1000)
    isPlaying.value = true
    tick()
  }
  const pause = () => {
    if (!hasAudio.value) return
    audio.pause()
    base.pause()
    isPlaying.value = false
    stopTick()
  }
  const toggle = () => (isPlaying.value ? pause() : play())

  const seek = (ratio: number) => {
    if (!hasAudio.value || !duration.value) return
    audio.currentTime = ratio * duration.value
    currentTime.value = audio.currentTime
    base.play(audio.currentTime * 1000)
  }

  const setVolume = (val: number) => {
    const v = Math.max(0, Math.min(1, val))
    audio.volume = v
    volume.value = v
    muted.value = v === 0
    if (v > 0) volumeBeforeMute = v
    persistState()
  }

  const toggleMute = () => {
    if (muted.value) setVolume(volumeBeforeMute || 1)
    else setVolume(0)
  }

  const onAudioTimeUpdate = () => {
    if (!isPlaying.value) currentTime.value = audio.currentTime
  }
  const onAudioEnded = () => {
    isPlaying.value = false
    base.pause()
    stopTick()
  }
  audio.addEventListener('timeupdate', onAudioTimeUpdate)
  audio.addEventListener('ended', onAudioEnded)

  const applyConfigPatch = (patch: Partial<Config.Root>) => {
    dom.config.update(patch)
  }

  onMounted(async () => {
    if (persisted.lyric) {
      applyLyric(persisted.lyric)
    }
    if (persisted.audioName) {
      audioName.value = persisted.audioName
      try {
        const file = await loadAudioFromDB()
        if (file) await loadAudioFile(file, persisted.audioName)
      } catch (err) {
        console.error(err)
      }
    }
  })

  onUnmounted(() => {
    audio.removeEventListener('timeupdate', onAudioTimeUpdate)
    audio.removeEventListener('ended', onAudioEnded)
    stopTick()
    dom.destroy()
  })

  return {
    isPlaying,
    hasAudio,
    hasLyric,
    audioName,
    lyricInfo,
    currentTime,
    duration,
    volume,
    muted,
    lyricElement,
    setAudioFromUser,
    applyLyric,
    clearLyric,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    toggleMute,
    applyConfigPatch,
  }
}
