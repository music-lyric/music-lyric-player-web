<template>
  <aside :class="[$style.sidebar, { [$style.open]: open }]">
    <div :class="$style.sidebarHeader">
      <div :class="$style.sidebarHeaderRow">
        <h1 :class="$style.sidebarTitle">
          {{ t('app.title') }}
          <span :class="$style.sidebarVersion">(v{{ version }})</span>
        </h1>
        <div :class="$style.sidebarHeaderActions">
          <button :class="$style.localeBtn" :title="t('app.changeLanguage')" @click="cycleLocale">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span :class="$style.localeLabel">{{ LOCALE_LABELS[locale] }}</span>
          </button>
          <a :class="$style.githubBtn" :href="GITHUB_URL" :title="t('app.github')" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.335-1.725-1.335-1.725-1.087-.731.084-.716.084-.716 1.205.082 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.295-.54-1.494.105-3.116 0 0 1.005-.31 3.3 1.209.96-.262 1.98-.392 3-.398 1.02.006 2.04.136 3 .398 2.28-1.519 3.285-1.209 3.285-1.209.645 1.622.24 2.821.12 3.116.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .314.21.683.825.566C20.565 21.917 24 17.495 24 12.292 24 5.78 18.627.5 12 .5z"
              />
            </svg>
          </a>
        </div>
      </div>
      <p :class="$style.sidebarSubtitle">{{ t('app.subtitle') }}</p>
    </div>

    <div :class="$style.sidebarTabsWrap">
      <nav :class="$style.sidebarTabs">
        <button
          v-for="(tab, i) in tabs"
          :key="tab.key"
          :class="[$style.sidebarTab, { [$style.active]: activeTab === tab.key }]"
          @click="((activeTab = tab.key), (indicatorIndex = i))"
        >
          {{ t(tab.labelKey) }}
        </button>
        <span :class="$style.sidebarTabIndicator" :style="indicatorStyle"></span>
      </nav>
    </div>

    <div :class="$style.sidebarBody">
      <AudioTab v-show="activeTab === 'audio'" />
      <LyricTab v-show="activeTab === 'lyric'" />
      <SettingsTab v-show="activeTab === 'settings'" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { LocaleKey } from '@root/composables/useI18n'

import { ref, computed } from 'vue'
import { useI18n } from '@root/composables/useI18n'

import AudioTab from '@root/components/tabs/audio-tab.vue'
import LyricTab from '@root/components/tabs/lyric-tab.vue'
import SettingsTab from '@root/components/tabs/settings-tab.vue'

defineProps<{ open: boolean }>()

const { t, locale, setLocale, available } = useI18n()

const version = __APP_VERSION__

const GITHUB_URL = 'https://github.com/music-lyric/music-lyric-player-web'

const LOCALE_LABELS: Record<LocaleKey, string> = {
  'en-us': 'EN',
  'zh-cn': '中',
}

const cycleLocale = () => {
  const i = available.indexOf(locale.value)
  const next = available[(i + 1) % available.length]
  setLocale(next)
}

type TabKey = 'audio' | 'lyric' | 'settings'

const tabs: { key: TabKey; labelKey: string }[] = [
  { key: 'audio', labelKey: 'tabs.audio' },
  { key: 'lyric', labelKey: 'tabs.lyric' },
  { key: 'settings', labelKey: 'tabs.settings' },
]

const activeTab = ref<TabKey>('audio')
const indicatorIndex = ref(0)

const indicatorStyle = computed(() => ({
  width: `calc(${100 / tabs.length}% - ${(4 * (tabs.length - 1)) / tabs.length}px)`,
  transform: `translateX(calc(${indicatorIndex.value * 100}% + ${indicatorIndex.value * 4}px))`,
}))
</script>

<style module lang="scss">
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

  &.open {
    transform: translateX(0);
    box-shadow: var(--shadow-md);
  }

  @media (max-width: 480px) {
    width: 320px;
  }
}

.sidebarHeader {
  padding: 18px 20px 14px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-border-soft);
}

.sidebarHeaderRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sidebarTitle {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.005em;
  color: var(--color-text);
}

.sidebarVersion {
  margin-left: 4px;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.sidebarSubtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--color-text-muted);
}

.localeBtn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
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

.localeLabel {
  min-width: 14px;
  text-align: center;
}

.sidebarHeaderActions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.githubBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
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
    width: 14px;
    height: 14px;
  }
}

.sidebarTabsWrap {
  padding: 12px 16px;
  flex-shrink: 0;
}

.sidebarTabs {
  position: relative;
  display: flex;
  background: var(--color-bg-alt);
  border-radius: var(--radius-md);
  padding: 4px;
  gap: 4px;
}

.sidebarTab {
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

  &:hover {
    color: var(--color-text);
  }

  &.active {
    color: var(--color-primary-strong);
  }
}

.sidebarTabIndicator {
  position: absolute;
  z-index: 0;
  top: 4px;
  bottom: 4px;
  left: 4px;
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  transition: transform var(--motion-base);
}

.sidebarBody {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
