<template>
  <div class="settings-tab">
    <div class="toolbar">
      <span class="toolbar-meta">Auto-saves on change</span>
      <button class="reset-btn" @click="settings.reset">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        <span>Reset</span>
      </button>
    </div>

    <div class="scroll">
      <SettingSection v-for="section in SECTIONS" :key="section.id" :section="section" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { useSettings } from '@root/composables/useSettings'

import { SECTIONS } from '@root/core/bindings'

import { inject } from 'vue'

import SettingSection from '@root/components/settings/setting-section.vue'

const settings = inject<ReturnType<typeof useSettings>>('settings')!
</script>

<style scoped>
.settings-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--color-border-soft);
  flex-shrink: 0;
}
.toolbar-meta {
  font-size: 11px;
  color: var(--color-text-muted);
}
.reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 500;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  transition:
    color var(--motion-fast),
    border-color var(--motion-fast),
    background var(--motion-fast);
}
.reset-btn:hover {
  color: var(--color-primary-strong);
  border-color: var(--color-primary-border);
  background: var(--color-primary-faint);
}
.reset-btn svg {
  width: 13px;
  height: 13px;
}

.scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
</style>
