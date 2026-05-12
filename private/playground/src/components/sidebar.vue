<template>
  <aside class="sidebar" :class="{ open }">
    <div class="sidebar-header">
      <h1 class="sidebar-title">Lyric Player Playground</h1>
      <p class="sidebar-subtitle">Tune, preview, and iterate.</p>
    </div>

    <div class="sidebar-tabs-wrap">
      <nav class="sidebar-tabs">
        <button v-for="tab in tabs" :key="tab.key" class="sidebar-tab" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
          {{ tab.label }}
        </button>
        <span class="sidebar-tab-indicator" :class="`pos-${activeTab}`"></span>
      </nav>
    </div>

    <div class="sidebar-body">
      <SourceTab v-show="activeTab === 'source'" />
      <SettingsTab v-show="activeTab === 'settings'" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import SourceTab from '@root/components/tabs/source-tab.vue'
import SettingsTab from '@root/components/tabs/settings-tab.vue'

defineProps<{ open: boolean }>()

type TabKey = 'source' | 'settings'

const activeTab = ref<TabKey>('source')

const tabs: { key: TabKey; label: string }[] = [
  { key: 'source', label: 'Source' },
  { key: 'settings', label: 'Settings' },
]
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  max-width: 90vw;
  background: var(--color-bg);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  transition: transform var(--motion-slow);
  z-index: 20;
}
.sidebar.open {
  transform: translateX(0);
  box-shadow: var(--shadow-md);
}

.sidebar-header {
  padding: 18px 20px 14px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-border-soft);
}
.sidebar-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.005em;
  color: var(--color-text);
}
.sidebar-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--color-text-muted);
}

.sidebar-tabs-wrap {
  padding: 12px 16px;
  flex-shrink: 0;
}
.sidebar-tabs {
  position: relative;
  display: flex;
  background: var(--color-bg-alt);
  border-radius: var(--radius-md);
  padding: 4px;
}
.sidebar-tab {
  position: relative;
  z-index: 1;
  flex: 1;
  height: 30px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  transition: color var(--motion-fast);
}
.sidebar-tab:hover {
  color: var(--color-text);
}
.sidebar-tab.active {
  color: var(--color-primary-strong);
}
.sidebar-tab-indicator {
  position: absolute;
  z-index: 0;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc(50% - 4px);
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  transition: transform var(--motion-base);
}
.sidebar-tab-indicator.pos-source {
  transform: translateX(0);
}
.sidebar-tab-indicator.pos-settings {
  transform: translateX(100%);
}

.sidebar-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@media (max-width: 480px) {
  .sidebar {
    width: 320px;
  }
}
</style>
