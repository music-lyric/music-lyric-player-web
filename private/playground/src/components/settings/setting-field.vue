<template>
  <div v-if="visible" class="row">
    <label class="row-label">{{ t(field.labelKey) }}</label>

    <div class="row-control">
      <template v-if="field.type === 'number'">
        <input
          class="ctrl input"
          type="number"
          :placeholder="field.placeholder"
          :step="field.step"
          :min="field.min"
          :max="field.max"
          :value="value ?? ''"
          @change="writeNumber(($event.target as HTMLInputElement).value)"
        />
      </template>

      <template v-else-if="field.type === 'text' || field.type === 'padding'">
        <input
          class="ctrl input"
          type="text"
          :placeholder="field.placeholder"
          :value="value ?? ''"
          @change="writeText(($event.target as HTMLInputElement).value)"
        />
      </template>

      <template v-else-if="field.type === 'select'">
        <select class="ctrl select" :value="value" @change="settings.apply(field.path, ($event.target as HTMLSelectElement).value)">
          <option v-for="o in field.options" :key="o.value" :value="o.value">{{ t(o.labelKey) }}</option>
        </select>
      </template>

      <template v-else-if="field.type === 'toggle'">
        <button class="toggle" :class="{ active: !!value }" :aria-pressed="!!value" @click="toggle">
          <span class="toggle-thumb"></span>
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FieldBinding } from '@root/core/bindings'
import type { useSettings } from '@root/composables/useSettings'

import { computed, inject } from 'vue'
import { useI18n } from '@root/composables/useI18n'

const props = defineProps<{ field: FieldBinding }>()

const settings = inject<ReturnType<typeof useSettings>>('settings')!

const { t } = useI18n()

const value = computed(() => settings.get(props.field.path))

const visible = computed(() => (props.field.showWhen ? props.field.showWhen(settings.current) : true))

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

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 36px;
  padding: 4px 0;
}
.row-label {
  flex: 1;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.row-control {
  flex-shrink: 0;
  width: 168px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
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
}
.ctrl:hover {
  border-color: var(--color-border-strong);
}
.ctrl:focus {
  border-color: var(--color-primary);
  box-shadow: var(--ring);
}

.ctrl.input::placeholder {
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
}
.toggle:hover {
  background: var(--color-text-muted);
}
.toggle.active {
  background: var(--color-primary);
}
.toggle.active:hover {
  background: var(--color-primary-strong);
}
.toggle:focus-visible {
  box-shadow: var(--ring);
}
.toggle-thumb {
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
.toggle.active .toggle-thumb {
  left: 18px;
}

@media (max-width: 480px) {
  .row-control {
    width: 140px;
  }
  .row-label {
    font-size: 12px;
  }
  .ctrl {
    font-size: 12px;
  }
}
</style>
