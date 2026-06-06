<template>
  <div :class="$style.select">
    <button ref="triggerEl" type="button" :class="[$style.trigger, { [$style.open]: open }]" @click="toggle">
      <span :class="[$style.value, { [$style.placeholder]: isDefault }]">{{ currentLabel }}</span>
      <svg :class="$style.arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <Teleport to="body">
      <ul v-if="open" ref="menuEl" :class="$style.menu" :style="menuStyle">
        <li
          v-for="o in options"
          :key="o.value"
          :class="[$style.option, { [$style.selected]: o.value === effective }]"
          @click="choose(o.value)"
        >
          <span :class="$style.optionLabel">{{ t(o.labelKey) }}</span>
          <span v-if="o.value === defaultValue" :class="$style.defaultTag">{{ t('settings.default') }}</span>
          <svg
            v-if="o.value === effective"
            :class="$style.check"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { SelectOption } from '@root/core/bindings'

import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from '@root/composables/useI18n'

const props = defineProps<{
  options: SelectOption[]
  modelValue: string | undefined
  defaultValue: string | undefined
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const { t } = useI18n()

const open = ref(false)
const triggerEl = ref<HTMLElement>()
const menuEl = ref<HTMLElement>()
const menuStyle = ref<Record<string, string>>({})

// Fall back to the inherited default so the control shows the effective value even when unset.
const effective = computed(() => props.modelValue ?? props.defaultValue)
const isDefault = computed(() => props.modelValue === undefined)
const currentLabel = computed(() => {
  const option = props.options.find((item) => item.value === effective.value)
  return option ? t(option.labelKey) : ''
})

const onOutside = (e: MouseEvent) => {
  const target = e.target as Node
  if (triggerEl.value?.contains(target) || menuEl.value?.contains(target)) {
    return
  }
  close()
}

// The menu is fixed-positioned off the trigger rect, so any scroll/resize would desync it: just close.
const onReposition = () => {
  if (open.value) {
    close()
  }
}

const bind = () => {
  document.addEventListener('click', onOutside)
  window.addEventListener('scroll', onReposition, true)
  window.addEventListener('resize', onReposition)
}
const unbind = () => {
  document.removeEventListener('click', onOutside)
  window.removeEventListener('scroll', onReposition, true)
  window.removeEventListener('resize', onReposition)
}

const openMenu = () => {
  const rect = triggerEl.value?.getBoundingClientRect()
  if (!rect) {
    return
  }
  menuStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  }
  open.value = true
  bind()
}
const close = () => {
  if (!open.value) {
    return
  }
  open.value = false
  unbind()
}
const toggle = () => {
  if (open.value) {
    close()
  } else {
    openMenu()
  }
}
const choose = (value: string) => {
  emit('update:modelValue', value)
  close()
}

onUnmounted(unbind)
</script>

<style module lang="scss">
.select {
  position: relative;
  width: 100%;
}

.trigger {
  width: 100%;
  height: 30px;
  padding: 0 8px 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  background: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  cursor: pointer;
  transition:
    border-color var(--motion-fast),
    box-shadow var(--motion-fast);

  &:hover {
    border-color: var(--color-border-strong);
  }

  &.open {
    border-color: var(--color-primary);
    box-shadow: var(--ring);
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
}

.value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.placeholder {
  color: var(--color-text-muted);
}

.arrow {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--color-text-muted);
  transition: transform var(--motion-fast);
}

.trigger.open .arrow {
  transform: rotate(180deg);
}

.menu {
  position: fixed;
  z-index: 50;
  margin: 0;
  padding: 4px;
  list-style: none;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  max-height: 240px;
  overflow-y: auto;
}

.option {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background var(--motion-fast),
    color var(--motion-fast);

  &:hover {
    background: var(--color-bg-alt);
    color: var(--color-text);
  }

  &.selected {
    color: var(--color-primary-strong);
  }
}

.optionLabel {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.defaultTag {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--color-text-muted);
  padding: 1px 6px;
  background: var(--color-bg-subtle);
  border-radius: var(--radius-full);
}

.check {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--color-primary);
}
</style>
