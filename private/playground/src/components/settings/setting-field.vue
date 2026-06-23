<template>
  <div v-if="visible" :class="[$style.row, { [$style.rowBlock]: field.type === 'order' }]">
    <label :class="$style.rowLabel">{{ t(field.labelKey) }}</label>

    <div :class="[$style.rowControl, { [$style.rowControlBlock]: field.type === 'order' }]">
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
        <SettingSelect
          :options="field.options ?? []"
          :model-value="value"
          :default-value="resolvedDefault"
          @update:model-value="apply"
        />
      </template>

      <template v-else-if="field.type === 'order'">
        <SettingOrder
          :options="field.options ?? []"
          :model-value="value"
          :default-value="resolvedDefault"
          @update:model-value="apply"
        />
      </template>

      <template v-else-if="field.type === 'toggle'">
        <SettingToggle :active="!!effectiveValue" @toggle="toggle" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FieldBinding } from '@root/core/bindings'
import type { useSettings } from '@root/composables/useSettings'

import SettingSelect from './setting-select.vue'
import SettingOrder from './setting-order.vue'
import SettingToggle from './setting-toggle.vue'

import { computed, inject } from 'vue'
import { useI18n } from '@root/composables/useI18n'
import { useFieldValue } from '@root/composables/useFieldValue'

const props = defineProps<{ field: FieldBinding }>()

const settings = inject<ReturnType<typeof useSettings>>('settings')!

const { t } = useI18n()

const { value, resolvedDefault, effectiveValue, apply } = useFieldValue(() => props.field.path)

const visible = computed(() => (props.field.showWhen ? props.field.showWhen(settings.current) : true))

const placeholder = computed(() => {
  if (props.field.placeholder !== undefined) return props.field.placeholder
  const resolved = resolvedDefault.value
  if (resolved == null || typeof resolved === 'object') return 'Inherit'
  return String(resolved)
})

const writeNumber = (raw: string) => {
  if (raw === '') {
    apply(undefined)
    return
  }
  const n = parseFloat(raw)
  if (!Number.isNaN(n)) apply(n)
}

const writeText = (raw: string) => {
  apply(raw === '' ? undefined : raw)
}

const toggle = () => {
  apply(!effectiveValue.value)
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

.rowBlock {
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
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

.rowControlBlock {
  width: 100%;
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
</style>
