<template>
  <div :class="[$style.group, { [$style.titled]: !!group.titleKey }]">
    <div v-if="group.titleKey" :class="$style.groupHead">
      <span :class="$style.groupTitle">{{ t(group.titleKey) }}</span>
      <SettingToggle v-if="hasMaster" :active="masterActive" @toggle="toggleMaster" />
    </div>

    <div v-if="hasMaster" :class="[$style.collapsible, { [$style.open]: masterActive }]">
      <div :class="$style.collapsibleInner">
        <div :class="[$style.groupRows, $style.collapsibleRows]">
          <SettingField v-for="field in bodyFields" :key="field.path" :field="field" />
        </div>
      </div>
    </div>
    <div v-else :class="[$style.groupRows, { [$style.spaced]: !!group.titleKey }]">
      <SettingField v-for="field in bodyFields" :key="field.path" :field="field" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GroupBinding } from '@root/core/bindings'

import SettingField from './setting-field.vue'
import SettingToggle from './setting-toggle.vue'

import { computed } from 'vue'
import { useI18n } from '@root/composables/useI18n'
import { useFieldValue } from '@root/composables/useFieldValue'

const props = defineProps<{ group: GroupBinding }>()

const { t } = useI18n()

// A titled group whose first field is an "*.enabled" toggle promotes that toggle to the header.
const first = props.group.fields[0]
const masterField = !!props.group.titleKey && first?.type === 'toggle' && first.path.endsWith('.enabled') ? first : null

const master = masterField ? useFieldValue(masterField.path) : null
const hasMaster = masterField !== null
const masterActive = computed(() => !!master?.effectiveValue.value)
const toggleMaster = () => master?.apply(!masterActive.value)

// When a master toggle is present it owns the first field; the rest collapse with it.
const bodyFields = hasMaster ? props.group.fields.slice(1) : props.group.fields
</script>

<style module lang="scss">
.group {
  display: flex;
  flex-direction: column;
}

.titled {
  padding: 10px 12px 12px;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
}

.groupHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 20px;
}

.groupTitle {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.groupRows {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.spaced {
  margin-top: 8px;
}

.collapsible {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--motion-base);
}

.collapsible.open {
  grid-template-rows: 1fr;
}

.collapsibleInner {
  min-height: 0;
  overflow: hidden;
}

.collapsibleRows {
  padding-top: 8px;
}
</style>
