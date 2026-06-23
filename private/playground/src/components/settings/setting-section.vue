<template>
  <div
    :class="[$style.section, $style[`level${level}`], { [$style.open]: isOpen, [$style.hasChildren]: !!section.children?.length }]"
  >
    <button v-if="collapsible" :class="$style.sectionHead" type="button" @click="toggle">
      <span :class="$style.sectionChevron">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </span>
      <span :class="$style.sectionTitle">{{ t(section.titleKey) }}</span>
    </button>
    <div v-else :class="[$style.sectionHead, $style.sectionHeadStatic]">
      <span :class="$style.sectionMarker" aria-hidden="true"></span>
      <span :class="$style.sectionTitle">{{ t(section.titleKey) }}</span>
    </div>

    <div v-show="isOpen" :class="$style.sectionBody">
      <SettingGroup v-for="(group, i) in section.groups" :key="i" :group="group" />

      <div v-if="section.children?.length" :class="$style.sectionChildren">
        <SettingSection v-for="child in orderedChildren" :key="child.id" :section="child" :level="level + 1" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SectionBinding } from '@root/core/bindings'

import SettingGroup from './setting-group.vue'

import { computed, ref } from 'vue'
import { useI18n } from '@root/composables/useI18n'
import { orderInlineFirst } from '@root/core/bindings'

defineOptions({ name: 'SettingSection' })

const props = withDefaults(defineProps<{ section: SectionBinding; level?: number }>(), { level: 0 })

const { t } = useI18n()

// Lightweight sections render inline; only collapsible ones keep the click-to-open header.
const collapsible = computed(() => props.section.collapsible !== false)
const open = ref(false)
const isOpen = computed(() => (collapsible.value ? open.value : true))
const toggle = () => (open.value = !open.value)

// Collapsible children sink below inline ones so folded items sit at the bottom of each level.
const orderedChildren = computed(() => orderInlineFirst(props.section.children ?? []))
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

.sectionHeadStatic {
  cursor: default;

  &:hover {
    background: transparent;
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

.sectionMarker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;

  &::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--color-primary);
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

    &.sectionHeadStatic:hover {
      background: var(--color-bg-subtle);
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
