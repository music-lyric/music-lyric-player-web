<template>
  <div class="app-shell" :class="{ 'sidebar-open': sidebarOpen }">
    <Sidebar :open="sidebarOpen" />
    <div class="sidebar-backdrop" @click="closeSidebar"></div>

    <main class="app-main">
      <LyricArea />
      <Controls />
    </main>
  </div>
</template>

<script setup lang="ts">
import type { Config } from '@music-lyric-player/dom'

import { provide, ref } from 'vue'
import { usePlayer } from '@root/composables/usePlayer'
import { useSettings } from '@root/composables/useSettings'

import Sidebar from '@root/components/sidebar.vue'
import LyricArea from '@root/components/lyric-area.vue'
import Controls from '@root/components/controls.vue'

const defaults: Partial<Config.Root> = {
  layout: { gap: 50 },
  line: { normal: { base: { font: { size: 48 } } } },
}

const player = usePlayer({ defaults })
const settings = useSettings({ defaults, applyConfigPatch: player.applyConfigPatch })

const sidebarOpen = ref(false)
const toggleSidebar = () => (sidebarOpen.value = !sidebarOpen.value)
const closeSidebar = () => (sidebarOpen.value = false)

provide('player', player)
provide('settings', settings)
provide('sidebar', { open: sidebarOpen, toggle: toggleSidebar, close: closeSidebar })
</script>

<style scoped>
.app-shell {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
  background: var(--color-bg);
}

.app-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  transition: margin-left var(--motion-slow);
  margin-left: 0;
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--motion-slow);
  z-index: 15;
}
.app-shell.sidebar-open .sidebar-backdrop {
  opacity: 1;
  pointer-events: auto;
}

@media (min-width: 768px) {
  .app-shell.sidebar-open .app-main {
    margin-left: var(--sidebar-width);
  }
  .sidebar-backdrop {
    display: none;
  }
}
</style>
