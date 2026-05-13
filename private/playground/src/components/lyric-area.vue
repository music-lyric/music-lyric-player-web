<template>
  <div class="lyric-area">
    <div ref="container" class="lyric-host"></div>
    <div v-if="!player.hasLyric.value" class="lyric-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
      <p class="lyric-empty-title">{{ t('lyricArea.empty') }}</p>
      <p class="lyric-empty-hint">{{ t('lyricArea.emptyHint') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { usePlayer } from '@root/composables/usePlayer'

import { inject, watch, onMounted, useTemplateRef } from 'vue'
import { useI18n } from '@root/composables/useI18n'

const player = inject<ReturnType<typeof usePlayer>>('player')!

const { t } = useI18n()

const containerRef = useTemplateRef<HTMLDivElement>('container')

const mount = () => {
  if (!containerRef.value) return
  if (containerRef.value.contains(player.lyricElement.value)) return
  player.lyricElement.value.style.width = '100%'
  player.lyricElement.value.style.height = '100%'
  containerRef.value.appendChild(player.lyricElement.value)
}

onMounted(mount)
watch(() => player.hasLyric.value, mount)
</script>

<style scoped>
.lyric-area {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: var(--color-bg);
}
.lyric-host {
  position: absolute;
  inset: 0;
}
.lyric-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--color-text-muted);
  pointer-events: none;
}
.lyric-empty svg {
  width: 48px;
  height: 48px;
  color: var(--color-primary-border);
}
.lyric-empty-title {
  margin: 4px 0 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}
.lyric-empty-hint {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
