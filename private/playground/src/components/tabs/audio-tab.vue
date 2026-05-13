<template>
  <div :class="$style.audioTab">
    <section :class="$style.section">
      <header :class="$style.sectionHead">
        <h3 :class="$style.sectionTitle">{{ t('audio.title') }}</h3>
        <span :class="$style.sectionHint">{{ t('audio.hint') }}</span>
      </header>
      <button :class="[$style.picker, { [$style.filled]: player.hasAudio.value }]" @click="pickAudio">
        <span :class="$style.pickerIcon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </span>
        <span :class="$style.pickerBody">
          <span :class="$style.pickerLabel">{{ player.hasAudio.value ? t('audio.fileFilled') : t('audio.filePick') }}</span>
          <span :class="$style.pickerMeta" :title="player.audioName.value">
            {{ player.audioName.value || t('audio.noFile') }}
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
import { useI18n } from '@root/composables/useI18n'

const player = inject<ReturnType<typeof usePlayer>>('player')!

const { t } = useI18n()

const audioInputRef = useTemplateRef<HTMLInputElement>('audioInput')

const pickAudio = () => audioInputRef.value?.click()

const onAudioChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  await player.setAudioFromUser(file)
}
</script>

<style module lang="scss">
.audioTab {
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

.sectionHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sectionTitle {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: 0.01em;
}

.sectionHint {
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

  &:hover,
  &.filled {
    border-color: var(--color-primary-border);
    background: var(--color-primary-faint);
  }

  &:focus-visible {
    border-color: var(--color-primary);
    box-shadow: var(--ring);
  }
}

.pickerIcon {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  border-radius: var(--radius-sm);
  flex-shrink: 0;

  svg {
    width: 18px;
    height: 18px;
  }
}

.pickerBody {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.pickerLabel {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
}

.pickerMeta {
  font-size: 12px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
