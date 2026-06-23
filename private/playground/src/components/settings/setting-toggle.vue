<template>
  <button :class="[$style.toggle, { [$style.active]: active }]" type="button" :aria-pressed="active" @click="emit('toggle')">
    <span :class="$style.toggleThumb"></span>
  </button>
</template>

<script setup lang="ts">
defineProps<{ active: boolean }>()

const emit = defineEmits<{ (e: 'toggle'): void }>()
</script>

<style module lang="scss">
.toggle {
  position: relative;
  flex-shrink: 0;
  width: 36px;
  height: 20px;
  background: var(--color-border-strong);
  border: none;
  border-radius: var(--radius-full);
  padding: 0;
  cursor: pointer;
  transition: background var(--motion-fast);

  &:hover {
    background: var(--color-text-muted);
  }

  &.active {
    background: var(--color-primary);

    &:hover {
      background: var(--color-primary-strong);
    }

    .toggleThumb {
      left: 18px;
    }
  }

  &:focus-visible {
    box-shadow: var(--ring);
  }
}

.toggleThumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: left var(--motion-fast);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}
</style>
