<template>
  <div :class="$style.master">
    <nav :class="$style.nav">
      <div v-for="scope in navScopes" :key="scope.scope" :class="$style.navScope">
        <div :class="$style.navScopeHead">
          <span :class="$style.navScopeTitle">{{ t(scope.titleKey) }}</span>
          <button :class="$style.navReset" type="button" :title="t('settings.reset')" @click="settings.reset(scope.scope)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        </div>

        <button
          v-for="item in scope.items"
          :key="item.id"
          type="button"
          :title="t(item.titleKey)"
          :class="[$style.navItem, { [$style.navItemActive]: item.id === selectedId }]"
          :style="{ paddingLeft: `${10 + item.depth * 12}px` }"
          @click="selectedId = item.id"
        >
          {{ t(item.titleKey) }}
        </button>
      </div>
    </nav>

    <div :class="$style.detail">
      <div :class="$style.detailHead">{{ selected ? t(selected.titleKey) : '' }}</div>
      <div :class="$style.detailBody">
        <SettingGroup v-for="(group, i) in selectedGroups" :key="`${selectedId}:${i}`" :group="group" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SectionBinding } from '@root/core/bindings'
import type { useSettings } from '@root/composables/useSettings'

import SettingGroup from './setting-group.vue'

import { BASE_SECTIONS, DOM_SECTIONS } from '@root/core/bindings'

import { computed, inject, ref } from 'vue'
import { useI18n } from '@root/composables/useI18n'

interface NavItem {
  id: string
  titleKey: string
  depth: number
}

const settings = inject<ReturnType<typeof useSettings>>('settings')!

const { t } = useI18n()

// Flatten a section tree into nav rows, keeping the declared order and tracking depth for indentation.
const flatten = (sections: readonly SectionBinding[], depth = 0, out: NavItem[] = []): NavItem[] => {
  for (const section of sections) {
    out.push({ id: section.id, titleKey: section.titleKey, depth })
    if (section.children?.length) {
      flatten(section.children, depth + 1, out)
    }
  }
  return out
}

const navScopes = [
  { scope: 'base' as const, titleKey: 'settings.scope.base', items: flatten(BASE_SECTIONS) },
  { scope: 'dom' as const, titleKey: 'settings.scope.dom', items: flatten(DOM_SECTIONS) },
]

const selectedId = ref(navScopes[0].items[0]?.id ?? navScopes[1].items[0]?.id ?? '')

const findSection = (sections: readonly SectionBinding[], id: string): SectionBinding | null => {
  for (const section of sections) {
    if (section.id === id) {
      return section
    }
    if (section.children) {
      const found = findSection(section.children, id)
      if (found) {
        return found
      }
    }
  }
  return null
}

const selected = computed(() => findSection(BASE_SECTIONS, selectedId.value) ?? findSection(DOM_SECTIONS, selectedId.value))
const selectedGroups = computed(() => selected.value?.groups ?? [])
</script>

<style module lang="scss">
.master {
  display: flex;
  gap: 12px;
  min-height: 0;
  padding: 16px;
}

.nav {
  flex-shrink: 0;
  width: 176px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 8px;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
}

.navScope {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.navScopeHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding: 0 6px 4px;
}

.navScopeTitle {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.navReset {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-xs);
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    color var(--motion-fast),
    background var(--motion-fast);

  &:hover {
    color: var(--color-primary-strong);
    background: var(--color-primary-faint);
  }

  svg {
    width: 12px;
    height: 12px;
  }
}

.navItem {
  display: block;
  width: 100%;
  padding: 6px 8px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  text-align: left;
  font-size: 12.5px;
  line-height: 1.3;
  color: var(--color-text-secondary);
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition:
    color var(--motion-fast),
    background var(--motion-fast),
    box-shadow var(--motion-fast);

  &:hover {
    background: var(--color-surface-hover);
    color: var(--color-text);
  }
}

// Selected row lifts to a white pill, echoing the sidebar's tab indicator.
.navItemActive {
  background: var(--color-bg);
  color: var(--color-primary-strong);
  font-weight: 600;
  box-shadow: var(--shadow-sm);

  &:hover {
    background: var(--color-bg);
    color: var(--color-primary-strong);
  }
}

.detail {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.detailHead {
  flex-shrink: 0;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border-soft);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--color-text);
}

.detailBody {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
