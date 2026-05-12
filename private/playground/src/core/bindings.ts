import type { Config } from '@music-lyric-player/dom'

export type FieldType = 'number' | 'text' | 'select' | 'toggle' | 'padding'

export interface SelectOption {
  value: string
  label: string
}

export interface FieldBinding {
  path: string
  label: string
  type: FieldType
  step?: number
  min?: number
  max?: number
  placeholder?: string
  options?: SelectOption[]
  showWhen?: (cfg: Partial<Config.Root>) => boolean
}

export interface GroupBinding {
  title?: string
  fields: FieldBinding[]
}

export interface SectionBinding {
  id: string
  title: string
  groups: GroupBinding[]
  children?: SectionBinding[]
}

const SCROLL_MODES: SelectOption[] = [
  { value: 'smooth', label: 'Smooth' },
  { value: 'ripple', label: 'Ripple' },
  { value: 'directional', label: 'Directional' },
  { value: 'stagger', label: 'Stagger' },
]

const stateFields = (prefix: string, includePlayed = false): GroupBinding[] => {
  const groups: GroupBinding[] = [
    {
      title: 'Normal State',
      fields: [
        { path: `${prefix}.style.normal.color`, label: 'Color', type: 'text', placeholder: 'Inherit' },
        { path: `${prefix}.style.normal.opacity`, label: 'Opacity', type: 'number', placeholder: 'Inherit', step: 0.05, min: 0, max: 1 },
      ],
    },
    {
      title: 'Active State',
      fields: [
        { path: `${prefix}.style.active.color`, label: 'Color', type: 'text', placeholder: 'Inherit' },
        { path: `${prefix}.style.active.opacity`, label: 'Opacity', type: 'number', placeholder: 'Inherit', step: 0.05, min: 0, max: 1 },
      ],
    },
  ]
  if (includePlayed) {
    groups.push({
      title: 'Played State',
      fields: [
        { path: `${prefix}.style.played.color`, label: 'Color', type: 'text', placeholder: 'Inherit' },
        { path: `${prefix}.style.played.opacity`, label: 'Opacity', type: 'number', placeholder: 'Inherit', step: 0.05, min: 0, max: 1 },
      ],
    })
  }
  return groups
}

const fontFields = (prefix: string): GroupBinding => ({
  title: 'Font',
  fields: [
    { path: `${prefix}.font.size`, label: 'Size', type: 'number', placeholder: 'Inherit', min: 8, max: 200, step: 1 },
    { path: `${prefix}.font.weight`, label: 'Weight', type: 'number', placeholder: 'Inherit', min: 100, max: 900, step: 100 },
    { path: `${prefix}.font.family`, label: 'Family', type: 'text', placeholder: 'Inherit' },
  ],
})

const classNameField = (prefix: string): FieldBinding => ({
  path: `${prefix}.className`,
  label: 'CSS Class',
  type: 'text',
  placeholder: 'Inherit',
})

export const SECTIONS: SectionBinding[] = [
  {
    id: 'container',
    title: 'Container',
    groups: [
      {
        fields: [
          { path: 'container.className', label: 'CSS Class', type: 'text', placeholder: '""' },
          { path: 'container.padding', label: 'Padding', type: 'padding', placeholder: '20px' },
        ],
      },
      {
        title: 'Edge Fade',
        fields: [
          { path: 'container.fade.enabled', label: 'Enabled', type: 'toggle' },
          { path: 'container.fade.top', label: 'Top (%)', type: 'text', placeholder: '5%' },
          { path: 'container.fade.bottom', label: 'Bottom (%)', type: 'text', placeholder: '10%' },
        ],
      },
    ],
  },
  {
    id: 'layout',
    title: 'Layout',
    groups: [
      {
        fields: [
          {
            path: 'layout.align',
            label: 'Align',
            type: 'select',
            options: [
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
            ],
          },
          { path: 'layout.gap', label: 'Line Gap', type: 'number', min: 0, max: 200, step: 1 },
        ],
      },
    ],
  },
  {
    id: 'effect',
    title: 'Effect',
    groups: [
      {
        title: 'Scale',
        fields: [
          { path: 'effect.scale.enabled', label: 'Enabled', type: 'toggle' },
          { path: 'effect.scale.min', label: 'Min', type: 'number', min: 0, max: 1, step: 0.05 },
          { path: 'effect.scale.max', label: 'Max', type: 'number', min: 0, max: 1, step: 0.05 },
        ],
      },
      {
        title: 'Blur',
        fields: [
          { path: 'effect.blur.enabled', label: 'Enabled', type: 'toggle' },
          { path: 'effect.blur.min', label: 'Min (px)', type: 'number', min: 0, max: 20, step: 0.1 },
          { path: 'effect.blur.max', label: 'Max (px)', type: 'number', min: 0, max: 20, step: 0.1 },
        ],
      },
    ],
  },
  {
    id: 'scroll',
    title: 'Scroll',
    groups: [
      {
        fields: [{ path: 'scroll.anchor', label: 'Anchor (%)', type: 'number', min: 0, max: 100, step: 1 }],
      },
      {
        title: 'Animation',
        fields: [
          { path: 'scroll.animation.mode', label: 'Mode', type: 'select', options: SCROLL_MODES },
          { path: 'scroll.animation.duration', label: 'Duration (ms)', type: 'number', min: 0, max: 2000, step: 50 },
          { path: 'scroll.animation.easing', label: 'Easing', type: 'text', placeholder: 'ease' },
          {
            path: 'scroll.animation.delay',
            label: 'Delay (ms)',
            type: 'number',
            min: 0,
            max: 1000,
            step: 10,
            showWhen: (c) => ((c.scroll?.animation as any)?.mode ?? 'smooth') === 'smooth',
          },
          {
            path: 'scroll.animation.range',
            label: 'Range (lines)',
            type: 'number',
            min: 1,
            max: 30,
            step: 1,
            showWhen: (c) => ((c.scroll?.animation as any)?.mode ?? 'smooth') !== 'smooth',
          },
          {
            path: 'scroll.animation.step',
            label: 'Step (ms)',
            type: 'number',
            min: 1,
            max: 200,
            step: 1,
            showWhen: (c) => ((c.scroll?.animation as any)?.mode ?? 'smooth') !== 'smooth',
          },
        ],
      },
    ],
  },
  {
    id: 'line',
    title: 'Line',
    groups: [{ fields: [classNameField('line')] }],
    children: [
      {
        id: 'line.normal.base',
        title: 'Normal Line',
        groups: [{ fields: [classNameField('line.normal.base')] }, fontFields('line.normal.base'), ...stateFields('line.normal.base', true)],
      },
      {
        id: 'line.normal.syllable',
        title: 'Syllable',
        groups: [
          {
            fields: [{ path: 'line.normal.syllable.enabled', label: 'Enabled', type: 'toggle' }, classNameField('line.normal.syllable')],
          },
          fontFields('line.normal.syllable'),
          ...stateFields('line.normal.syllable', true),
          {
            title: 'Float Animation',
            fields: [
              { path: 'line.normal.syllable.animation.float.enabled', label: 'Enabled', type: 'toggle' },
              { path: 'line.normal.syllable.animation.float.from', label: 'From (px)', type: 'number', step: 0.5, min: -50, max: 50 },
              { path: 'line.normal.syllable.animation.float.to', label: 'To (px)', type: 'number', step: 0.5, min: -50, max: 50 },
            ],
          },
          {
            title: 'Mask Animation',
            fields: [
              { path: 'line.normal.syllable.animation.mask.enabled', label: 'Enabled', type: 'toggle' },
              {
                path: 'line.normal.syllable.animation.mask.feather.normal',
                label: 'Feather Normal',
                type: 'number',
                min: 0,
                max: 2,
                step: 0.05,
              },
              {
                path: 'line.normal.syllable.animation.mask.feather.first',
                label: 'Feather First',
                type: 'number',
                min: 0,
                max: 5,
                step: 0.05,
              },
              {
                path: 'line.normal.syllable.animation.mask.feather.last',
                label: 'Feather Last',
                type: 'number',
                min: 0,
                max: 5,
                step: 0.05,
              },
            ],
          },
        ],
      },
      {
        id: 'line.normal.extended',
        title: 'Extended',
        groups: [
          { fields: [{ path: 'line.normal.extended.visible', label: 'Visible', type: 'toggle' }, classNameField('line.normal.extended.base')] },
          fontFields('line.normal.extended.base'),
          ...stateFields('line.normal.extended.base', true),
        ],
        children: [
          {
            id: 'line.normal.extended.translate',
            title: 'Translation',
            groups: [
              {
                fields: [
                  { path: 'line.normal.extended.translate.visible', label: 'Visible', type: 'toggle' },
                  classNameField('line.normal.extended.translate'),
                ],
              },
              fontFields('line.normal.extended.translate'),
              ...stateFields('line.normal.extended.translate', true),
            ],
          },
          {
            id: 'line.normal.extended.roman',
            title: 'Romanization',
            groups: [
              {
                fields: [{ path: 'line.normal.extended.roman.visible', label: 'Visible', type: 'toggle' }, classNameField('line.normal.extended.roman')],
              },
              fontFields('line.normal.extended.roman'),
              ...stateFields('line.normal.extended.roman', true),
            ],
          },
        ],
      },
      {
        id: 'line.interlude',
        title: 'Interlude',
        groups: [
          {
            fields: [classNameField('line.interlude'), { path: 'line.interlude.size', label: 'Dot Size', type: 'number', min: 4, max: 64, step: 1 }],
          },
          {
            title: 'Normal State',
            fields: [
              { path: 'line.interlude.style.normal.color', label: 'Color', type: 'text', placeholder: 'Inherit' },
              { path: 'line.interlude.style.normal.opacity', label: 'Opacity', type: 'number', placeholder: 'Inherit', step: 0.05, min: 0, max: 1 },
              { path: 'line.interlude.style.normal.hide', label: 'Hide When Inactive', type: 'toggle' },
            ],
          },
          {
            title: 'Active State',
            fields: [
              { path: 'line.interlude.style.active.color', label: 'Color', type: 'text', placeholder: 'Inherit' },
              { path: 'line.interlude.style.active.opacity', label: 'Opacity', type: 'number', placeholder: 'Inherit', step: 0.05, min: 0, max: 1 },
            ],
          },
        ],
      },
    ],
  },
]
