<template>
  <div class="audio-tab">
    <section class="section">
      <header class="section-head">
        <h3 class="section-title">Audio</h3>
        <span class="section-hint">Local file, persisted in browser storage</span>
      </header>
      <button class="picker" :class="{ filled: player.hasAudio.value }" @click="pickAudio">
        <span class="picker-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </span>
        <span class="picker-body">
          <span class="picker-label">{{ player.hasAudio.value ? 'Audio file' : 'Choose an audio file' }}</span>
          <span class="picker-meta" :title="player.audioName.value">
            {{ player.audioName.value || 'No file selected' }}
          </span>
        </span>
      </button>
      <input ref="audioInput" type="file" accept="audio/*" hidden @change="onAudioChange" />
    </section>
  </div>
</template>

<script setup lang="ts">
import type { usePlayer } from '@root/composables/usePlayer'

import { inject, useTemplateRef } from 'vue'

const player = inject<ReturnType<typeof usePlayer>>('player')!

const audioInputRef = useTemplateRef<HTMLInputElement>('audioInput')

const pickAudio = () => audioInputRef.value?.click()

const onAudioChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  await player.setAudioFromUser(file)
}
</script>

<style scoped>
.audio-tab {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
  overflow-y: auto;
  height: 100%;
  min-height: 0;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.section-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: 0.01em;
}
.section-hint {
  font-size: 11px;
  color: var(--color-text-muted);
}

.picker {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-align: left;
  transition:
    border-color var(--motion-fast),
    background var(--motion-fast),
    box-shadow var(--motion-fast);
}
.picker:hover {
  border-color: var(--color-primary-border);
  background: var(--color-primary-faint);
}
.picker.filled {
  border-color: var(--color-primary-border);
  background: var(--color-primary-faint);
}
.picker:focus-visible {
  border-color: var(--color-primary);
  box-shadow: var(--ring);
}
.picker-icon {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}
.picker-icon svg {
  width: 18px;
  height: 18px;
}
.picker-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.picker-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
}
.picker-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
