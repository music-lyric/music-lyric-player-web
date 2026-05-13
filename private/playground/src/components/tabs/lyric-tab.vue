<template>
  <div class="lyric-tab">
    <section class="section">
      <header class="section-head">
        <h3 class="section-title">Lyric</h3>
        <div class="format-tabs">
          <button class="format-tab" :class="{ active: format === 'lrc' }" @click="format = 'lrc'">LRC</button>
          <button class="format-tab" :class="{ active: format === 'ttml' }" @click="format = 'ttml'">TTML</button>
        </div>
      </header>

      <div class="lyric-fields">
        <template v-if="format === 'lrc'">
          <div class="field">
            <label>Original</label>
            <textarea v-model="lrcOriginal" spellcheck="false" placeholder="Paste LRC content..." rows="10"></textarea>
          </div>
          <div class="field">
            <label>Romanization</label>
            <textarea v-model="lrcRoman" spellcheck="false" placeholder="Optional romanization LRC..." rows="6"></textarea>
          </div>
          <div class="field">
            <label>Translation</label>
            <textarea v-model="lrcTranslate" spellcheck="false" placeholder="Optional translation LRC..." rows="6"></textarea>
          </div>
        </template>
        <template v-else>
          <div class="field grow">
            <label>Original (TTML)</label>
            <textarea v-model="ttmlOriginal" spellcheck="false" placeholder="Paste TTML content..." rows="18"></textarea>
            <div class="ttml-file">
              <button class="file-btn" @click="pickTtml">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Choose TTML File</span>
              </button>
              <span class="file-name" :class="{ filled: !!ttmlFileName }">{{ ttmlFileName || 'No file selected' }}</span>
              <input ref="ttmlFile" type="file" accept=".ttml,.xml" hidden @change="onTtmlFile" />
            </div>
          </div>
        </template>
      </div>

      <div class="lyric-footer">
        <button class="action secondary" @click="clearLyric">Clear</button>
        <button class="action primary" @click="applyLyric">Apply</button>
      </div>
    </section>

    <section class="section parser">
      <header class="section-head">
        <h3 class="section-title">Parser</h3>
        <span class="section-hint">Auto re-applies on change</span>
      </header>

      <div class="parser-groups">
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

import ParserGroup from '@root/components/parser/parser-group.vue'

const player = inject<ReturnType<typeof usePlayer>>('player')!

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
      alert('Please provide LRC original content.')
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
      alert('Please provide TTML original content or choose a file.')
      return
    }
    stored = {
      format: 'ttml',
      ttmlOriginal: original,
      ttmlFileName: ttmlFileName.value || undefined,
    }
  }
  const ok = player.applyLyric(stored)
  if (!ok) alert('Failed to parse the provided lyric.')
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
    label: 'Pure Clean',
    hint: 'Strip song/creator info from header lines',
    enabledPath: 'pureClean.enabled',
    fields: [
      { type: 'toggle', label: 'First line with music info', path: 'pureClean.firstLineWithMusicInfo' },
    ],
  },
  {
    key: 'pureExtract',
    label: 'Pure Extract',
    hint: 'Extract creator info from header',
    enabledPath: 'pureExtract.enabled',
    fields: [],
  },
  {
    key: 'agentExtract',
    label: 'Agent Extract',
    hint: 'Extract per-line agent (e.g. "F:" prefix)',
    enabledPath: 'agentExtract.enabled',
    fields: [],
  },
  {
    key: 'backgroundExtract',
    label: 'Background Extract',
    hint: 'Detect parenthesized background lines',
    enabledPath: 'backgroundExtract.enabled',
    fields: [
      { type: 'toggle', label: 'Full line  e.g. (lyric)', path: 'backgroundExtract.fullLine' },
      { type: 'toggle', label: 'In line  e.g. lyric (extra) lyric', path: 'backgroundExtract.inLine' },
      { type: 'toggle', label: 'Cross line  e.g. (lyric\\nlyric)', path: 'backgroundExtract.crossLine' },
    ],
  },
  {
    key: 'backgroundClean',
    label: 'Background Clean',
    hint: 'Remove leftover background markers',
    enabledPath: 'backgroundClean.enabled',
    fields: [],
  },
  {
    key: 'interludeInsert',
    label: 'Interlude Insert',
    hint: 'Insert interlude markers at long gaps',
    enabledPath: 'interludeInsert.enabled',
    fields: [
      { type: 'number', label: 'First gap (ms)', path: 'interludeInsert.first', min: 0, step: 500 },
      { type: 'number', label: 'Normal gap (ms)', path: 'interludeInsert.normal', min: 0, step: 500 },
    ],
  },
  {
    key: 'spaceInsert',
    label: 'Space Insert',
    hint: 'Insert spaces between CJK / Latin / punctuation',
    enabledPath: 'spaceInsert.enabled',
    fields: [
      { type: 'toggle', label: 'Original line', path: 'spaceInsert.original' },
      { type: 'toggle', label: 'Extended (translation / roman)', path: 'spaceInsert.extended' },
    ],
  },
  {
    key: 'stressMark',
    label: 'Stress Mark',
    hint: 'Mark syllables held longer than threshold',
    enabledPath: 'stressMark.enabled',
    fields: [{ type: 'number', label: 'Hold threshold (ms)', path: 'stressMark.checkTime', min: 0, step: 500 }],
  },
])
</script>

<style scoped>
.lyric-tab {
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
.section.parser {
  gap: 8px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.section-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: 0.01em;
}
.section-hint {
  font-size: 11px;
  color: var(--color-text-muted);
}

.format-tabs {
  display: inline-flex;
  background: var(--color-bg-alt);
  border-radius: var(--radius-full);
  padding: 2px;
}
.format-tab {
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
}
.format-tab:hover {
  color: var(--color-primary);
}
.format-tab.active {
  background: var(--color-bg);
  color: var(--color-primary-strong);
  box-shadow: var(--shadow-sm);
}

.lyric-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.field textarea {
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
}
.field textarea:focus {
  border-color: var(--color-primary);
  background: var(--color-bg);
  box-shadow: var(--ring);
}

.ttml-file {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.file-btn {
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
}
.file-btn:hover {
  border-color: var(--color-primary-border);
  color: var(--color-primary);
  background: var(--color-primary-faint);
}
.file-btn svg {
  width: 14px;
  height: 14px;
}
.file-name {
  font-size: 12px;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-name.filled {
  color: var(--color-text-secondary);
}

.lyric-footer {
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
}
.action.secondary:hover {
  border-color: var(--color-border-strong);
  color: var(--color-text);
}
.action.primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
}
.action.primary:hover {
  background: var(--color-primary-strong);
  border-color: var(--color-primary-strong);
}
.action:focus-visible {
  box-shadow: var(--ring);
}

.parser-groups {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
