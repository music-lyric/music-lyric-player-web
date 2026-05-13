<template>
  <div :class="$style.lyricTab">
    <section :class="$style.section">
      <header :class="$style.sectionHead">
        <h3 :class="$style.sectionTitle">{{ t('lyric.title') }}</h3>
        <div :class="$style.formatTabs">
          <button :class="[$style.formatTab, { [$style.active]: format === 'lrc' }]" @click="format = 'lrc'">{{ t('lyric.format.lrc') }}</button>
          <button :class="[$style.formatTab, { [$style.active]: format === 'ttml' }]" @click="format = 'ttml'">{{ t('lyric.format.ttml') }}</button>
        </div>
      </header>

      <div :class="$style.lyricFields">
        <template v-if="format === 'lrc'">
          <div :class="$style.field">
            <label>{{ t('lyric.field.original') }}</label>
            <textarea v-model="lrcOriginal" spellcheck="false" :placeholder="t('lyric.placeholder.lrc')" rows="10"></textarea>
          </div>
          <div :class="$style.field">
            <label>{{ t('lyric.field.roman') }}</label>
            <textarea v-model="lrcRoman" spellcheck="false" :placeholder="t('lyric.placeholder.lrcRoman')" rows="6"></textarea>
          </div>
          <div :class="$style.field">
            <label>{{ t('lyric.field.translate') }}</label>
            <textarea v-model="lrcTranslate" spellcheck="false" :placeholder="t('lyric.placeholder.lrcTranslate')" rows="6"></textarea>
          </div>
        </template>
        <template v-else>
          <div :class="[$style.field, $style.grow]">
            <label>{{ t('lyric.field.originalTtml') }}</label>
            <textarea v-model="ttmlOriginal" spellcheck="false" :placeholder="t('lyric.placeholder.ttml')" rows="18"></textarea>
            <div :class="$style.ttmlFile">
              <button :class="$style.fileBtn" @click="pickTtml">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>{{ t('lyric.ttmlChoose') }}</span>
              </button>
              <span :class="[$style.fileName, { [$style.filled]: !!ttmlFileName }]">{{ ttmlFileName || t('lyric.noFile') }}</span>
              <input ref="ttmlFile" type="file" accept=".ttml,.xml" hidden @change="onTtmlFile" />
            </div>
          </div>
        </template>
      </div>

      <div :class="$style.lyricFooter">
        <button :class="[$style.action, $style.secondary]" @click="clearLyric">{{ t('lyric.clear') }}</button>
        <button :class="[$style.action, $style.primary]" @click="applyLyric">{{ t('lyric.apply') }}</button>
      </div>
    </section>

    <section :class="[$style.section, $style.parser]">
      <header :class="$style.sectionHead">
        <h3 :class="$style.sectionTitle">{{ t('parser.title') }}</h3>
        <span :class="$style.sectionHint">{{ t('parser.hint') }}</span>
      </header>

      <div :class="$style.parserGroups">
        <ParserGroup v-for="g in groups" :key="g.key" :group="g" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { LyricFormat, StoredLyric } from '@root/core/storage'
import type { usePlayer } from '@root/composables/usePlayer'
import type { ParserGroupDef } from '@root/components/parser/parser-group.vue'

import { inject, ref, useTemplateRef, computed } from 'vue'
import { useI18n } from '@root/composables/useI18n'

import ParserGroup from '@root/components/parser/parser-group.vue'

const player = inject<ReturnType<typeof usePlayer>>('player')!

const { t } = useI18n()

const initial = player.lyricInfo.value
const format = ref<LyricFormat>(initial?.format ?? 'lrc')

const lrcOriginal = ref(initial?.lrcOriginal ?? '')
const lrcRoman = ref(initial?.lrcRoman ?? '')
const lrcTranslate = ref(initial?.lrcTranslate ?? '')
const ttmlOriginal = ref(initial?.ttmlOriginal ?? '')
const ttmlFileName = ref(initial?.ttmlFileName ?? '')

const ttmlFileRef = useTemplateRef<HTMLInputElement>('ttmlFile')

const pickTtml = () => ttmlFileRef.value?.click()

const onTtmlFile = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  ttmlOriginal.value = await file.text()
  ttmlFileName.value = file.name
}

const applyLyric = () => {
  let stored: StoredLyric
  if (format.value === 'lrc') {
    const original = lrcOriginal.value.trim()
    if (!original) {
      alert(t('lyric.alert.lrcEmpty'))
      return
    }
    stored = {
      format: 'lrc',
      lrcOriginal: original,
      lrcRoman: lrcRoman.value.trim() || undefined,
      lrcTranslate: lrcTranslate.value.trim() || undefined,
    }
  } else {
    const original = ttmlOriginal.value.trim()
    if (!original) {
      alert(t('lyric.alert.ttmlEmpty'))
      return
    }
    stored = {
      format: 'ttml',
      ttmlOriginal: original,
      ttmlFileName: ttmlFileName.value || undefined,
    }
  }
  const ok = player.applyLyric(stored)
  if (!ok) alert(t('lyric.alert.parseFailed'))
}

const clearLyric = () => {
  lrcOriginal.value = ''
  lrcRoman.value = ''
  lrcTranslate.value = ''
  ttmlOriginal.value = ''
  ttmlFileName.value = ''
  player.clearLyric()
}

const groups = computed<ParserGroupDef[]>(() => [
  {
    key: 'pureClean',
    labelKey: 'parser.group.pureClean.label',
    hintKey: 'parser.group.pureClean.hint',
    enabledPath: 'pureClean.enabled',
    fields: [{ type: 'toggle', labelKey: 'parser.group.pureClean.firstLineWithMusicInfo', path: 'pureClean.firstLineWithMusicInfo' }],
  },
  {
    key: 'pureExtract',
    labelKey: 'parser.group.pureExtract.label',
    hintKey: 'parser.group.pureExtract.hint',
    enabledPath: 'pureExtract.enabled',
    fields: [],
  },
  {
    key: 'agentExtract',
    labelKey: 'parser.group.agentExtract.label',
    hintKey: 'parser.group.agentExtract.hint',
    enabledPath: 'agentExtract.enabled',
    fields: [],
  },
  {
    key: 'backgroundExtract',
    labelKey: 'parser.group.backgroundExtract.label',
    hintKey: 'parser.group.backgroundExtract.hint',
    enabledPath: 'backgroundExtract.enabled',
    fields: [
      { type: 'toggle', labelKey: 'parser.group.backgroundExtract.fullLine', path: 'backgroundExtract.fullLine' },
      { type: 'toggle', labelKey: 'parser.group.backgroundExtract.inLine', path: 'backgroundExtract.inLine' },
      { type: 'toggle', labelKey: 'parser.group.backgroundExtract.crossLine', path: 'backgroundExtract.crossLine' },
    ],
  },
  {
    key: 'backgroundClean',
    labelKey: 'parser.group.backgroundClean.label',
    hintKey: 'parser.group.backgroundClean.hint',
    enabledPath: 'backgroundClean.enabled',
    fields: [],
  },
  {
    key: 'interludeInsert',
    labelKey: 'parser.group.interludeInsert.label',
    hintKey: 'parser.group.interludeInsert.hint',
    enabledPath: 'interludeInsert.enabled',
    fields: [
      { type: 'number', labelKey: 'parser.group.interludeInsert.first', path: 'interludeInsert.first', min: 0, step: 500 },
      { type: 'number', labelKey: 'parser.group.interludeInsert.normal', path: 'interludeInsert.normal', min: 0, step: 500 },
    ],
  },
  {
    key: 'spaceInsert',
    labelKey: 'parser.group.spaceInsert.label',
    hintKey: 'parser.group.spaceInsert.hint',
    enabledPath: 'spaceInsert.enabled',
    fields: [
      { type: 'toggle', labelKey: 'parser.group.spaceInsert.original', path: 'spaceInsert.original' },
      { type: 'toggle', labelKey: 'parser.group.spaceInsert.extended', path: 'spaceInsert.extended' },
    ],
  },
  {
    key: 'stressMark',
    labelKey: 'parser.group.stressMark.label',
    hintKey: 'parser.group.stressMark.hint',
    enabledPath: 'stressMark.enabled',
    fields: [{ type: 'number', labelKey: 'parser.group.stressMark.checkTime', path: 'stressMark.checkTime', min: 0, step: 500 }],
  },
])
</script>

<style module lang="scss">
.lyricTab {
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

  &.parser {
    gap: 8px;
  }
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

.sectionHint {
  font-size: 11px;
  color: var(--color-text-muted);
}

.formatTabs {
  display: inline-flex;
  background: var(--color-bg-alt);
  border-radius: var(--radius-full);
  padding: 2px;
}

.formatTab {
  padding: 4px 12px;
  border: none;
  background: transparent;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition:
    color var(--motion-fast),
    background var(--motion-fast);

  &:hover {
    color: var(--color-primary);
  }

  &.active {
    background: var(--color-bg);
    color: var(--color-primary-strong);
    box-shadow: var(--shadow-sm);
  }
}

.lyricFields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  textarea {
    resize: none;
    min-height: 160px;
    padding: 10px 12px;
    font-size: 12px;
    font-family: var(--font-mono);
    line-height: 1.5;
    background: var(--color-bg-subtle);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    outline: none;
    transition:
      border-color var(--motion-fast),
      background var(--motion-fast),
      box-shadow var(--motion-fast);

    &:focus {
      border-color: var(--color-primary);
      background: var(--color-bg);
      box-shadow: var(--ring);
    }
  }
}

.ttmlFile {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.fileBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--color-text-secondary);
  transition:
    border-color var(--motion-fast),
    color var(--motion-fast),
    background var(--motion-fast);

  &:hover {
    border-color: var(--color-primary-border);
    color: var(--color-primary);
    background: var(--color-primary-faint);
  }

  svg {
    width: 14px;
    height: 14px;
  }
}

.fileName {
  font-size: 12px;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.filled {
    color: var(--color-text-secondary);
  }
}

.lyricFooter {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.action {
  padding: 7px 16px;
  font-size: 12px;
  font-weight: 500;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text-secondary);
  transition:
    border-color var(--motion-fast),
    color var(--motion-fast),
    background var(--motion-fast),
    box-shadow var(--motion-fast);

  &.secondary:hover {
    border-color: var(--color-border-strong);
    color: var(--color-text);
  }

  &.primary {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-text-inverse);

    &:hover {
      background: var(--color-primary-strong);
      border-color: var(--color-primary-strong);
    }
  }

  &:focus-visible {
    box-shadow: var(--ring);
  }
}

.parserGroups {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
