<template>
  <div :class="[$style.group, { [$style.titled]: !!group.titleKey }]">
    <!-- Fold header: a chevron collapses detail groups (font / state), closed by default. -->
    <button v-if="collapsible" type="button" :class="[$style.groupHead, $style.groupHeadButton, { [$style.openHead]: open }]" @click="open = !open">
      <span :class="$style.groupChevron">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </span>
      <span :class="$style.groupTitle">{{ title }}</span>
    </button>
    <!-- Master header: an "*.enabled" toggle drives the same collapse. -->
    <div v-else-if="hasMaster" :class="$style.groupHead">
      <span :class="$style.groupTitle">{{ title }}</span>
      <SettingToggle :active="masterActive" @toggle="toggleMaster" />
    </div>
    <!-- Plain label for an always-open titled group. -->
    <div v-else-if="group.titleKey" :class="$style.groupHead">
      <span :class="$style.groupTitle">{{ title }}</span>
    </div>

    <div v-if="isCollapsible" :class="[$style.collapsible, { [$style.open]: isOpen }]">
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

import { computed, ref } from 'vue'
import { useI18n } from '@root/composables/useI18n'
import { useFieldValue } from '@root/composables/useFieldValue'

const props = defineProps<{ group: GroupBinding }>()

const { t } = useI18n()

const title = computed(() => (props.group.titleKey ? t(props.group.titleKey) : ''))

// A titled group whose first field is an "*.enabled" toggle promotes that toggle to the header.
const first = props.group.fields[0]
const masterField = !!props.group.titleKey && first?.type === 'toggle' && first.path.endsWith('.enabled') ? first : null

const master = masterField ? useFieldValue(masterField.path) : null
const hasMaster = masterField !== null
const masterActive = computed(() => !!master?.effectiveValue.value)
const toggleMaster = () => master?.apply(!masterActive.value)

// Detail groups (font / state) fold behind a chevron, collapsed by default; mutually exclusive with a master toggle.
const collapsible = !hasMaster && !!props.group.titleKey && props.group.collapsible === true
const open = ref(false)

const isCollapsible = hasMaster || collapsible
const isOpen = computed(() => (hasMaster ? masterActive.value : open.value))

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

// The fold header turns the whole title row into a left-aligned click target.
.groupHeadButton {
  justify-content: flex-start;
  width: 100%;
  padding: 0;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  color: inherit;

  &:hover .groupTitle {
    color: var(--color-text-secondary);
  }
}

.groupChevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  color: var(--color-text-muted);
  transition: transform var(--motion-base);

  svg {
    width: 11px;
    height: 11px;
  }
}

.openHead .groupChevron {
  transform: rotate(90deg);
}

.groupTitle {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  transition: color var(--motion-fast);
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
