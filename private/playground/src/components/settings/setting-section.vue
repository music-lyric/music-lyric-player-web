<template>
  <div :class="[$style.section, $style[`level${level}`], { [$style.open]: open, [$style.hasChildren]: !!section.children?.length }]">
    <button :class="$style.sectionHead" @click="toggle">
      <span :class="$style.sectionChevron">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </span>
      <span :class="$style.sectionTitle">{{ t(section.titleKey) }}</span>
    </button>

    <div v-show="open" :class="$style.sectionBody">
      <div v-for="(group, i) in section.groups" :key="i" :class="[$style.group, { [$style.titled]: !!group.titleKey }]">
        <div v-if="group.titleKey" :class="$style.groupTitle">{{ t(group.titleKey) }}</div>
        <div :class="$style.groupRows">
          <SettingField v-for="field in group.fields" :key="field.path" :field="field" />
        </div>
      </div>

      <div v-if="section.children?.length" :class="$style.sectionChildren">
        <SettingSection v-for="child in section.children" :key="child.id" :section="child" :level="level + 1" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SectionBinding } from '@root/core/bindings'

import { ref } from 'vue'
import { useI18n } from '@root/composables/useI18n'

import SettingField from './setting-field.vue'

defineOptions({ name: 'SettingSection' })

withDefaults(defineProps<{ section: SectionBinding; level?: number }>(), { level: 0 })

const { t } = useI18n()

const open = ref(false)
const toggle = () => (open.value = !open.value)
</script>

<style module lang="scss">
.section {
  border-bottom: 1px solid var(--color-border-soft);

  &:last-child {
    border-bottom: none;
  }

  &.open > .sectionHead .sectionChevron {
    transform: rotate(90deg);
  }
}

.sectionHead {
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

  &:hover {
    background: var(--color-bg-alt);
  }
}

.sectionChevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: var(--color-text-muted);
  transition: transform var(--motion-base);

  svg {
    width: 12px;
    height: 12px;
  }
}

.sectionTitle {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.005em;
}

.sectionBody {
  padding: 4px 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &.titled {
    padding: 10px 12px 12px;
    background: var(--color-bg-subtle);
    border: 1px solid var(--color-border-soft);
    border-radius: var(--radius-md);
  }
}

.groupTitle {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.groupRows {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sectionChildren {
  border-top: 1px solid var(--color-border-soft);
  margin: 0 -16px -14px;

  > .section {
    border-bottom: 1px solid var(--color-border-soft);

    &:last-child {
      border-bottom: none;
    }
  }
}

.level1 {
  > .sectionHead {
    padding-left: 28px;
    background: var(--color-bg-subtle);

    &:hover {
      background: var(--color-bg-alt);
    }

    .sectionTitle {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-secondary);
    }
  }

  > .sectionBody {
    padding-left: 28px;
  }

  &.open > .sectionHead .sectionTitle {
    color: var(--color-primary-strong);
  }
}

.level2 {
  > .sectionHead {
    padding-left: 44px;

    .sectionTitle {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-secondary);
    }
  }

  > .sectionBody {
    padding-left: 44px;
  }

  &.open > .sectionHead .sectionTitle {
    color: var(--color-primary-strong);
  }
}
</style>
