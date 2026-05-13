<template>
  <div :class="[$style.slider, { [$style.dragging]: dragging, [$style.disabled]: disabled }]" @mousedown="onStart" @touchstart.passive="onStart">
    <div ref="track" :class="$style.sliderTrack">
      <div :class="$style.sliderFill" :style="{ width: `${ratio * 100}%` }"></div>
      <div :class="$style.sliderThumb" :style="{ left: `${ratio * 100}%` }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

interface Props {
  ratio: number
  disabled?: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'seek', ratio: number): void
  (e: 'seek-end', ratio: number): void
}>()

const trackRef = useTemplateRef<HTMLDivElement>('track')
const dragging = ref(false)

const clamp = (v: number) => Math.max(0, Math.min(1, v))

const getRatio = (clientX: number) => {
  if (!trackRef.value) return 0
  const rect = trackRef.value.getBoundingClientRect()
  return clamp((clientX - rect.left) / rect.width)
}

const seek = (clientX: number) => {
  const ratio = getRatio(clientX)
  emit('seek', ratio)
  return ratio
}

const onStart = (e: MouseEvent | TouchEvent) => {
  if (props.disabled) return
  dragging.value = true
  let lastRatio = seek('touches' in e ? e.touches[0].clientX : e.clientX)

  const onMove = (ev: MouseEvent | TouchEvent) => {
    if (!dragging.value) return
    lastRatio = seek('touches' in ev ? ev.touches[0].clientX : ev.clientX)
  }
  const onEnd = () => {
    dragging.value = false
    emit('seek-end', lastRatio)
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('touchmove', onMove)
    document.removeEventListener('mouseup', onEnd)
    document.removeEventListener('touchend', onEnd)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('touchmove', onMove, { passive: true })
  document.addEventListener('mouseup', onEnd)
  document.addEventListener('touchend', onEnd)
}
</script>

<style module lang="scss">
.slider {
  display: flex;
  align-items: center;
  height: 24px;
  cursor: pointer;
  user-select: none;

  &.disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  &:hover .sliderThumb,
  &.dragging .sliderThumb {
    transform: translateY(-50%) scale(1);
  }

  &.dragging {
    .sliderFill {
      transition: none;
    }
    .sliderThumb {
      transition: transform var(--motion-fast);
    }
  }
}

.sliderTrack {
  position: relative;
  width: 100%;
  height: 3px;
  background: var(--color-border);
  border-radius: var(--radius-sm);
}

.sliderFill {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-sm);
  transition: width 50ms linear;
}

.sliderThumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  margin-left: -6px;
  background: var(--color-primary);
  border-radius: 50%;
  transform: translateY(-50%) scale(0);
  transition:
    transform var(--motion-fast),
    left 50ms linear;
}
</style>
