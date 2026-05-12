<template>
  <div class="controls">
    <button class="control-btn icon" :class="{ active: sidebar.open.value }" title="Toggle sidebar" @click="sidebar.toggle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>

    <button class="control-btn primary" :disabled="!player.hasAudio.value" :title="player.isPlaying.value ? 'Pause' : 'Play'" @click="player.toggle">
      <svg v-if="!player.isPlaying.value" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="4" width="4" height="16" />
        <rect x="14" y="4" width="4" height="16" />
      </svg>
    </button>

    <div class="progress">
      <Slider :ratio="progress" :disabled="!player.hasAudio.value" @seek="player.seek" />
    </div>

    <div class="time">{{ timeText }}</div>

    <div class="volume">
      <button class="control-btn icon" :title="player.muted.value ? 'Unmute' : 'Mute'" @click="player.toggleMute">
        <svg v-if="!player.muted.value" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      </button>
      <div class="volume-slider">
        <Slider :ratio="player.volume.value" @seek="player.setVolume" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'
import type { usePlayer } from '@root/composables/usePlayer'

import { inject, computed } from 'vue'
import { formatTime } from '@root/utils'

import Slider from '@root/components/slider.vue'

const player = inject<ReturnType<typeof usePlayer>>('player')!
const sidebar = inject<{ open: Ref<boolean>; toggle: () => void; close: () => void }>('sidebar')!

const progress = computed(() => (player.duration.value ? player.currentTime.value / player.duration.value : 0))

const timeText = computed(() => `${formatTime(player.currentTime.value)} / ${formatTime(player.duration.value)}`)
</script>

<style scoped>
.controls {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  height: var(--controls-height);
  border-top: 1px solid var(--color-border);
  background: var(--color-bg);
  flex-shrink: 0;
}

.control-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  transition:
    color var(--motion-fast),
    background var(--motion-fast);
}
.control-btn:hover {
  color: var(--color-primary);
  background: var(--color-primary-faint);
}
.control-btn.icon {
  width: 34px;
  height: 34px;
}
.control-btn.icon svg {
  width: 18px;
  height: 18px;
}
.control-btn.icon.active {
  color: var(--color-primary);
  background: var(--color-primary-faint);
}
.control-btn.primary {
  width: 38px;
  height: 38px;
  color: var(--color-primary);
}
.control-btn.primary:hover {
  background: var(--color-primary-faint);
}
.control-btn.primary:disabled {
  color: var(--color-text-muted);
  background: transparent;
  cursor: not-allowed;
}
.control-btn.primary svg {
  width: 18px;
  height: 18px;
}

.progress {
  flex: 1;
  min-width: 0;
}

.time {
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.volume {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
}
.volume-slider {
  width: 100px;
}

@media (max-width: 640px) {
  .controls {
    gap: 8px;
    padding: 0 12px;
  }
  .time {
    display: none;
  }
  .volume {
    min-width: 0;
  }
  .volume-slider {
    display: none;
  }
}
</style>
