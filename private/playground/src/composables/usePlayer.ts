import type { BaseLyricPlayerConfig, DomLyricPlayerConfig } from 'music-lyric-player'
import type { StoredLyric } from '@root/core/storage'
import type { ParserOptions } from '@root/core/parser-options'

import { Lyric } from 'music-lyric-kit'
import { BaseLyricPlayer, DomLyricPlayer } from 'music-lyric-player'

import { ref, reactive, shallowRef, onMounted, onUnmounted } from 'vue'
import { parseStoredLyric } from '@root/core/parser'
import { loadParserOptions, saveParserOptions } from '@root/core/parser-options'
import { loadState, saveState, loadSettings, loadAudioFromDB, saveAudioToDB } from '@root/core/storage'
import { debounce, deepMerge, patchFromPath } from '@root/utils'

interface UsePlayerOptions {
  defaults: {
    base?: Partial<BaseLyricPlayerConfig.Root>
    dom?: Partial<DomLyricPlayerConfig.Root>
  }
}

export const usePlayer = ({ defaults }: UsePlayerOptions) => {
  const base = new BaseLyricPlayer()
  const dom = new DomLyricPlayer(base)

  const savedSettings = loadSettings()
  const mergedBase = deepMerge(deepMerge({}, defaults.base ?? {}), savedSettings.base ?? {})
  const mergedDom = deepMerge(deepMerge({}, defaults.dom ?? {}), savedSettings.dom ?? {})
  base.config.merge(mergedBase)
  dom.config.merge(mergedDom)

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
  let isSeeking = false

  audio.volume = volume.value

  const lyricElement = shallowRef<HTMLElement>(dom.element)

  const parserOptions = reactive<ParserOptions>(loadParserOptions())
  const persistParserOptions = debounce(() => {
    saveParserOptions(parserOptions as ParserOptions)
  }, 250)

  const tick = () => {
    if (!isPlaying.value) return
    if (!isSeeking) currentTime.value = audio.currentTime
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
    const result = parseStoredLyric(stored, parserOptions as ParserOptions)
    if (!result) return false
    base.updateLyric(result.result)
    hasLyric.value = true
    lyricInfo.value = stored
    persistState()
    return true
  }

  const updateParserOption = (path: string, value: unknown) => {
    const patch = patchFromPath(path, value)
    deepMerge(parserOptions, patch)
    persistParserOptions()
    if (lyricInfo.value) {
      applyLyric(lyricInfo.value)
    }
  }

  const clearLyric = () => {
    base.updateLyric(Lyric.Parsed.makeParsedInfo())
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

  // While dragging the progress slider: only seek the lyric (and the
  // displayed currentTime). The audio element is left alone so playback
  // is not interrupted; it commits in `seek` on drag end. Base is always
  // paused here so the lyric does not drift forward between drag steps —
  // important for backward drag where forward drift makes the wipe jitter.
  const previewSeek = (ratio: number) => {
    if (!hasAudio.value || !duration.value) return
    const time = ratio * duration.value
    isSeeking = true
    currentTime.value = time
    base.play(time * 1000)
  }

  const seekToTime = (ms: number) => {
    if (!hasAudio.value || !duration.value) return
    const time = Math.min(Math.max(ms, 0) / 1000, duration.value)
    audio.currentTime = time
    currentTime.value = audio.currentTime
    isSeeking = false
    base.play(audio.currentTime * 1000)
    if (!isPlaying.value) base.pause()
  }

  const seek = (ratio: number) => {
    seekToTime(ratio * duration.value * 1000)
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

  // Clicking a lyric line seeks playback to that line's start time.
  dom.event.add('lineClick', (line) => {
    const time = Lyric.Parsed.getParsedLineTime(line)?.start
    if (time === undefined) {
      return
    }
    seekToTime(base.convertContentTime(time))
  })

  const applyBasePatch = (patch: Partial<BaseLyricPlayerConfig.Root>) => {
    base.config.merge(patch)
  }

  const applyDomPatch = (patch: Partial<DomLyricPlayerConfig.Root>) => {
    dom.config.merge(patch)
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
    previewSeek,
    setVolume,
    toggleMute,
    applyBasePatch,
    applyDomPatch,
    parserOptions,
    updateParserOption,
  }
}
