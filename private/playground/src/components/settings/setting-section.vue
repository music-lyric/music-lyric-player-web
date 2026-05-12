<template>
  <div class="section" :class="[`level-${level}`, { open, 'has-children': !!section.children?.length }]">
    <button class="section-head" @click="toggle">
      <span class="section-chevron">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </span>
      <span class="section-title">{{ section.title }}</span>
    </button>

    <div v-show="open" class="section-body">
      <div v-for="(group, i) in section.groups" :key="i" class="group" :class="{ titled: !!group.title }">
        <div v-if="group.title" class="group-title">{{ group.title }}</div>
        <div class="group-rows">
          <SettingField v-for="field in group.fields" :key="field.path" :field="field" />
        </div>
      </div>

      <div v-if="section.children?.length" class="section-children">
        <SettingSection v-for="child in section.children" :key="child.id" :section="child" :level="level + 1" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SectionBinding } from '@root/core/bindings'

import { ref } from 'vue'

import SettingField from './setting-field.vue'

defineOptions({ name: 'SettingSection' })

withDefaults(defineProps<{ section: SectionBinding; level?: number }>(), { level: 0 })

const open = ref(false)
const toggle = () => (open.value = !open.value)
</script>

<style scoped>
.section {
  border-bottom: 1px solid var(--color-border-soft);
}
.section:last-child {
  border-bottom: none;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 11px 16px;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  color: var(--color-text);
  transition: background var(--motion-fast);
}
.section-head:hover {
  background: var(--color-bg-alt);
}
.section-chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: var(--color-text-muted);
  transition: transform var(--motion-base);
}
.section-chevron svg {
  width: 12px;
  height: 12px;
}
.section.open > .section-head .section-chevron {
  transform: rotate(90deg);
}
.section-title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.005em;
}

.section-body {
  padding: 4px 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.group.titled {
  padding: 10px 12px 12px;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
}
.group-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}
.group-rows {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.section-children {
  border-top: 1px solid var(--color-border-soft);
  margin: 0 -16px -14px;
}
.section-children > .section {
  border-bottom: 1px solid var(--color-border-soft);
}
.section-children > .section:last-child {
  border-bottom: none;
}

.section.level-1 > .section-head {
  padding-left: 28px;
  background: var(--color-bg-subtle);
}
.section.level-1 > .section-head:hover {
  background: var(--color-bg-alt);
}
.section.level-1 > .section-body {
  padding-left: 28px;
}
.section.level-2 > .section-head {
  padding-left: 44px;
}
.section.level-2 > .section-body {
  padding-left: 44px;
}

.section.level-1 .section-title,
.section.level-2 .section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}
.section.level-1.open > .section-head .section-title,
.section.level-2.open > .section-head .section-title {
  color: var(--color-primary-strong);
}
</style>
