<template>
  <div v-if="visible" :class="$style.row">
    <label :class="$style.rowLabel">{{ t(field.labelKey) }}</label>

    <div :class="$style.rowControl">
      <template v-if="field.type === 'number'">
        <input
          :class="[$style.ctrl, $style.input]"
          type="number"
          :placeholder="placeholder"
          :step="field.step"
          :min="field.min"
          :max="field.max"
          :value="value ?? ''"
          @change="writeNumber(($event.target as HTMLInputElement).value)"
        />
      </template>

      <template v-else-if="field.type === 'text' || field.type === 'padding'">
        <input
          :class="[$style.ctrl, $style.input]"
          type="text"
          :placeholder="placeholder"
          :value="value ?? ''"
          @change="writeText(($event.target as HTMLInputElement).value)"
        />
      </template>

      <template v-else-if="field.type === 'select'">
        <select :class="[$style.ctrl, $style.select]" :value="value" @change="settings.apply(field.path, ($event.target as HTMLSelectElement).value)">
          <option v-for="o in field.options" :key="o.value" :value="o.value">{{ t(o.labelKey) }}</option>
        </select>
      </template>

      <template v-else-if="field.type === 'toggle'">
        <button :class="[$style.toggle, { [$style.active]: !!value }]" :aria-pressed="!!value" @click="toggle">
          <span :class="$style.toggleThumb"></span>
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FieldBinding } from '@root/core/bindings'
import type { useSettings } from '@root/composables/useSettings'

import { DEFAULT_CONFIG } from '@music-lyric-player/dom'
import { computed, inject } from 'vue'
import { useI18n } from '@root/composables/useI18n'
import { resolveInheritedValue } from '@root/utils'

const props = defineProps<{ field: FieldBinding }>()

const settings = inject<ReturnType<typeof useSettings>>('settings')!

const { t } = useI18n()

const value = computed(() => settings.get(props.field.path))

const visible = computed(() => (props.field.showWhen ? props.field.showWhen(settings.current) : true))

const placeholder = computed(() => {
  if (props.field.placeholder !== undefined) return props.field.placeholder
  const resolved = resolveInheritedValue(props.field.path, settings.current, DEFAULT_CONFIG)
  if (resolved == null || typeof resolved === 'object') return 'Inherit'
  return String(resolved)
})

const writeNumber = (raw: string) => {
  if (raw === '') {
    settings.apply(props.field.path, undefined)
    return
  }
  const n = parseFloat(raw)
  if (!Number.isNaN(n)) settings.apply(props.field.path, n)
}

const writeText = (raw: string) => {
  settings.apply(props.field.path, raw === '' ? undefined : raw)
}

const toggle = () => {
  settings.apply(props.field.path, !value.value)
}
</script>

<style module lang="scss">
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 36px;
  padding: 4px 0;
}

.rowLabel {
  flex: 1;
  font-size: 13px;
  color: var(--color-text-secondary);

  @media (max-width: 480px) {
    font-size: 12px;
  }
}

.rowControl {
  flex-shrink: 0;
  width: 168px;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  @media (max-width: 480px) {
    width: 140px;
  }
}

.ctrl {
  width: 100%;
  height: 30px;
  padding: 0 10px;
  font-size: 13px;
  background: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
  transition:
    border-color var(--motion-fast),
    box-shadow var(--motion-fast);

  &:hover {
    border-color: var(--color-border-strong);
  }

  &:focus {
    border-color: var(--color-primary);
    box-shadow: var(--ring);
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
}

.input::placeholder {
  color: var(--color-text-muted);
}

.toggle {
  position: relative;
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
