<template>
  <div :class="$style.settingsTab">
    <section :class="$style.section">
      <header :class="$style.sectionHead">
        <h3 :class="$style.sectionTitle">{{ t('settings.scope.base') }}</h3>
        <button :class="$style.resetBtn" @click="settings.reset('base')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <span>{{ t('settings.reset') }}</span>
        </button>
      </header>
      <div :class="$style.sectionBody">
        <SettingSection v-for="section in orderedBase" :key="section.id" :section="section" />
      </div>
    </section>

    <section :class="$style.section">
      <header :class="$style.sectionHead">
        <h3 :class="$style.sectionTitle">{{ t('settings.scope.dom') }}</h3>
        <button :class="$style.resetBtn" @click="settings.reset('dom')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <span>{{ t('settings.reset') }}</span>
        </button>
      </header>
      <div :class="$style.sectionBody">
        <SettingSection v-for="section in orderedDom" :key="section.id" :section="section" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { useSettings } from '@root/composables/useSettings'

import { BASE_SECTIONS, DOM_SECTIONS } from '@root/core/bindings'

import { inject } from 'vue'
import { useI18n } from '@root/composables/useI18n'
import { orderInlineFirst } from '@root/core/bindings'

import SettingSection from '@root/components/settings/setting-section.vue'

const settings = inject<ReturnType<typeof useSettings>>('settings')!

const { t } = useI18n()

const orderedBase = orderInlineFirst(BASE_SECTIONS)
const orderedDom = orderInlineFirst(DOM_SECTIONS)
</script>

<style module lang="scss">
.settingsTab {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
  overflow-y: auto;
  height: 100%;
  min-height: 0;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sectionHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sectionTitle {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: 0.01em;
}

.resetBtn {
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

  &:hover {
    color: var(--color-primary-strong);
    border-color: var(--color-primary-border);
    background: var(--color-primary-faint);
  }

  svg {
    width: 13px;
    height: 13px;
  }
}

.sectionBody {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  overflow: hidden;
}
</style>
