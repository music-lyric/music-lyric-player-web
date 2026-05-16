import type { Config } from '@music-lyric-player/dom'

export type FieldType = 'number' | 'text' | 'select' | 'toggle' | 'padding'

export interface SelectOption {
  value: string
  labelKey: string
}

export interface FieldBinding {
  path: string
  labelKey: string
  type: FieldType
  step?: number
  min?: number
  max?: number
  placeholder?: string
  options?: SelectOption[]
  showWhen?: (cfg: Partial<Config.Root>) => boolean
}

export interface GroupBinding {
  titleKey?: string
  fields: FieldBinding[]
}

export interface SectionBinding {
  id: string
  titleKey: string
  groups: GroupBinding[]
  children?: SectionBinding[]
}

const SCROLL_MODES: SelectOption[] = [
  { value: 'smooth', labelKey: 'settings.field.scrollModeSmooth' },
  { value: 'ripple', labelKey: 'settings.field.scrollModeRipple' },
  { value: 'directional', labelKey: 'settings.field.scrollModeDirectional' },
  { value: 'stagger', labelKey: 'settings.field.scrollModeStagger' },
]

const stateFields = (prefix: string, includePlayed = false): GroupBinding[] => {
  const groups: GroupBinding[] = [
    {
      titleKey: 'settings.group.normalState',
      fields: [
        { path: `${prefix}.style.normal.color`, labelKey: 'settings.field.color', type: 'text' },
        { path: `${prefix}.style.normal.opacity`, labelKey: 'settings.field.opacity', type: 'number', step: 0.05, min: 0, max: 1 },
      ],
    },
    {
      titleKey: 'settings.group.activeState',
      fields: [
        { path: `${prefix}.style.active.color`, labelKey: 'settings.field.color', type: 'text' },
        { path: `${prefix}.style.active.opacity`, labelKey: 'settings.field.opacity', type: 'number', step: 0.05, min: 0, max: 1 },
      ],
    },
  ]
  if (includePlayed) {
    groups.push({
      titleKey: 'settings.group.playedState',
      fields: [
        { path: `${prefix}.style.played.color`, labelKey: 'settings.field.color', type: 'text' },
        { path: `${prefix}.style.played.opacity`, labelKey: 'settings.field.opacity', type: 'number', step: 0.05, min: 0, max: 1 },
      ],
    })
  }
  return groups
}

const fontFields = (prefix: string): GroupBinding => ({
  titleKey: 'settings.group.font',
  fields: [
    { path: `${prefix}.font.size`, labelKey: 'settings.field.fontSize', type: 'number', min: 8, max: 200, step: 1 },
    { path: `${prefix}.font.weight`, labelKey: 'settings.field.fontWeight', type: 'number', min: 100, max: 900, step: 100 },
    { path: `${prefix}.font.family`, labelKey: 'settings.field.fontFamily', type: 'text' },
  ],
})

const classNameField = (prefix: string): FieldBinding => ({
  path: `${prefix}.className`,
  labelKey: 'settings.field.className',
  type: 'text',
})

export const SECTIONS: SectionBinding[] = [
  {
    id: 'container',
    titleKey: 'settings.section.container',
    groups: [
      {
        fields: [
          { path: 'container.className', labelKey: 'settings.field.className', type: 'text', placeholder: '""' },
          { path: 'container.padding', labelKey: 'settings.field.padding', type: 'padding' },
        ],
      },
      {
        titleKey: 'settings.group.edgeFade',
        fields: [
          { path: 'container.fade.enabled', labelKey: 'settings.field.enabled', type: 'toggle' },
          { path: 'container.fade.top', labelKey: 'settings.field.fadeTop', type: 'text' },
          { path: 'container.fade.bottom', labelKey: 'settings.field.fadeBottom', type: 'text' },
        ],
      },
    ],
  },
  {
    id: 'layout',
    titleKey: 'settings.section.layout',
    groups: [
      {
        fields: [
          {
            path: 'layout.align',
            labelKey: 'settings.field.align',
            type: 'select',
            options: [
              { value: 'left', labelKey: 'settings.field.alignLeft' },
              { value: 'center', labelKey: 'settings.field.alignCenter' },
              { value: 'right', labelKey: 'settings.field.alignRight' },
            ],
          },
          { path: 'layout.gap', labelKey: 'settings.field.lineGap', type: 'number', min: 0, max: 200, step: 1 },
        ],
      },
    ],
  },
  {
    id: 'effect',
    titleKey: 'settings.section.effect',
    groups: [
      {
        titleKey: 'settings.group.scale',
        fields: [
          { path: 'effect.scale.enabled', labelKey: 'settings.field.enabled', type: 'toggle' },
          { path: 'effect.scale.min', labelKey: 'settings.field.scaleMin', type: 'number', min: 0, max: 1, step: 0.05 },
          { path: 'effect.scale.max', labelKey: 'settings.field.scaleMax', type: 'number', min: 0, max: 1, step: 0.05 },
        ],
      },
      {
        titleKey: 'settings.group.blur',
        fields: [
          { path: 'effect.blur.enabled', labelKey: 'settings.field.enabled', type: 'toggle' },
          { path: 'effect.blur.min', labelKey: 'settings.field.blurMin', type: 'number', min: 0, max: 20, step: 0.1 },
          { path: 'effect.blur.max', labelKey: 'settings.field.blurMax', type: 'number', min: 0, max: 20, step: 0.1 },
        ],
      },
    ],
  },
  {
    id: 'scroll',
    titleKey: 'settings.section.scroll',
    groups: [
      {
        fields: [{ path: 'scroll.anchor', labelKey: 'settings.field.scrollAnchor', type: 'number', min: 0, max: 100, step: 1 }],
      },
      {
        titleKey: 'settings.group.animation',
        fields: [
          { path: 'scroll.animation.mode', labelKey: 'settings.field.scrollMode', type: 'select', options: SCROLL_MODES },
          { path: 'scroll.animation.duration', labelKey: 'settings.field.scrollDuration', type: 'number', min: 0, max: 2000, step: 50 },
          { path: 'scroll.animation.easing', labelKey: 'settings.field.scrollEasing', type: 'text' },
          {
            path: 'scroll.animation.delay',
            labelKey: 'settings.field.scrollDelay',
            type: 'number',
            min: 0,
            max: 1000,
            step: 10,
            showWhen: (c) => ((c.scroll?.animation as any)?.mode ?? 'smooth') === 'smooth',
          },
          {
            path: 'scroll.animation.range',
            labelKey: 'settings.field.scrollRange',
            type: 'number',
            min: 1,
            max: 30,
            step: 1,
            showWhen: (c) => ((c.scroll?.animation as any)?.mode ?? 'smooth') !== 'smooth',
          },
          {
            path: 'scroll.animation.step',
            labelKey: 'settings.field.scrollStep',
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
    titleKey: 'settings.section.line',
    groups: [{ fields: [classNameField('line')] }],
    children: [
      {
        id: 'line.normal.base',
        titleKey: 'settings.section.lineNormalBase',
        groups: [{ fields: [classNameField('line.normal.base')] }, fontFields('line.normal.base'), ...stateFields('line.normal.base', true)],
      },
      {
        id: 'line.normal.syllable',
        titleKey: 'settings.section.lineNormalSyllable',
        groups: [
          {
            fields: [
              { path: 'line.normal.syllable.enabled', labelKey: 'settings.field.enabled', type: 'toggle' },
              classNameField('line.normal.syllable'),
            ],
          },
          fontFields('line.normal.syllable'),
          ...stateFields('line.normal.syllable', true),
          {
            titleKey: 'settings.group.floatAnimation',
            fields: [
              { path: 'line.normal.syllable.animation.float.enabled', labelKey: 'settings.field.enabled', type: 'toggle' },
              {
                path: 'line.normal.syllable.animation.float.from',
                labelKey: 'settings.field.floatFrom',
                type: 'number',
                step: 0.5,
                min: -50,
                max: 50,
              },
              { path: 'line.normal.syllable.animation.float.to', labelKey: 'settings.field.floatTo', type: 'number', step: 0.5, min: -50, max: 50 },
            ],
          },
          {
            titleKey: 'settings.group.maskAnimation',
            fields: [
              { path: 'line.normal.syllable.animation.mask.enabled', labelKey: 'settings.field.enabled', type: 'toggle' },
              {
                path: 'line.normal.syllable.animation.mask.feather.normal',
                labelKey: 'settings.field.maskFeatherNormal',
                type: 'number',
                min: 0,
                max: 2,
                step: 0.05,
              },
              {
                path: 'line.normal.syllable.animation.mask.feather.first',
                labelKey: 'settings.field.maskFeatherFirst',
                type: 'number',
                min: 0,
                max: 5,
                step: 0.05,
              },
              {
                path: 'line.normal.syllable.animation.mask.feather.last',
                labelKey: 'settings.field.maskFeatherLast',
                type: 'number',
                min: 0,
                max: 5,
                step: 0.05,
              },
            ],
          },
          {
            titleKey: 'settings.group.emphasizeAnimation',
            fields: [
              { path: 'line.normal.syllable.animation.emphasize.enabled', labelKey: 'settings.field.enabled', type: 'toggle' },
              {
                path: 'line.normal.syllable.animation.emphasize.minDuration',
                labelKey: 'settings.field.emphasizeMinDuration',
                type: 'number',
                min: 0,
                max: 5000,
                step: 100,
              },
              {
                path: 'line.normal.syllable.animation.emphasize.disablePlaybackRate',
                labelKey: 'settings.field.emphasizeDisableRate',
                type: 'number',
                min: 1,
                max: 20,
                step: 0.5,
              },
            ],
          },
          {
            titleKey: 'settings.group.emphasizeMain',
            fields: [
              { path: 'line.normal.syllable.animation.emphasize.effects.main.enabled', labelKey: 'settings.field.enabled', type: 'toggle' },
              {
                path: 'line.normal.syllable.animation.emphasize.effects.main.scale',
                labelKey: 'settings.field.emphasizeMainScale',
                type: 'number',
                min: 0,
                max: 1,
                step: 0.01,
              },
              {
                path: 'line.normal.syllable.animation.emphasize.effects.main.offsetHorizontal',
                labelKey: 'settings.field.emphasizeMainOffsetH',
                type: 'number',
                min: 0,
                max: 20,
                step: 0.1,
              },
              {
                path: 'line.normal.syllable.animation.emphasize.effects.main.offsetVertical',
                labelKey: 'settings.field.emphasizeMainOffsetV',
                type: 'number',
                min: 0,
                max: 20,
                step: 0.1,
              },
              {
                path: 'line.normal.syllable.animation.emphasize.effects.main.easingRise',
                labelKey: 'settings.field.emphasizeMainEasingRise',
                type: 'text',
              },
              {
                path: 'line.normal.syllable.animation.emphasize.effects.main.easingFall',
                labelKey: 'settings.field.emphasizeMainEasingFall',
                type: 'text',
              },
            ],
          },
          {
            titleKey: 'settings.group.emphasizeGlow',
            fields: [
              { path: 'line.normal.syllable.animation.emphasize.effects.glow.enabled', labelKey: 'settings.field.enabled', type: 'toggle' },
              {
                path: 'line.normal.syllable.animation.emphasize.effects.glow.color',
                labelKey: 'settings.field.emphasizeGlowColor',
                type: 'text',
              },
              {
                path: 'line.normal.syllable.animation.emphasize.effects.glow.maxRadius',
                labelKey: 'settings.field.emphasizeGlowMaxRadius',
                type: 'number',
                min: 0,
                max: 50,
                step: 0.5,
              },
              {
                path: 'line.normal.syllable.animation.emphasize.effects.glow.maxAlpha',
                labelKey: 'settings.field.emphasizeGlowMaxAlpha',
                type: 'number',
                min: 0,
                max: 1,
                step: 0.05,
              },
              {
                path: 'line.normal.syllable.animation.emphasize.effects.glow.easing',
                labelKey: 'settings.field.emphasizeGlowEasing',
                type: 'text',
              },
            ],
          },
          {
            titleKey: 'settings.group.emphasizeFloat',
            fields: [
              { path: 'line.normal.syllable.animation.emphasize.effects.float.enabled', labelKey: 'settings.field.enabled', type: 'toggle' },
              {
                path: 'line.normal.syllable.animation.emphasize.effects.float.amplitude',
                labelKey: 'settings.field.emphasizeFloatAmplitude',
                type: 'number',
                min: 0,
                max: 20,
                step: 0.5,
              },
              {
                path: 'line.normal.syllable.animation.emphasize.effects.float.duration.scale',
                labelKey: 'settings.field.emphasizeFloatDurationScale',
                type: 'number',
                min: 0,
                max: 5,
                step: 0.1,
              },
              {
                path: 'line.normal.syllable.animation.emphasize.effects.float.duration.lead',
                labelKey: 'settings.field.emphasizeFloatDurationLead',
                type: 'number',
                min: 0,
                max: 2000,
                step: 50,
              },
              {
                path: 'line.normal.syllable.animation.emphasize.effects.float.easing',
                labelKey: 'settings.field.emphasizeFloatEasing',
                type: 'text',
              },
            ],
          },
        ],
      },
      {
        id: 'line.normal.extended',
        titleKey: 'settings.section.lineNormalExtended',
        groups: [
          {
            fields: [
              { path: 'line.normal.extended.visible', labelKey: 'settings.field.visible', type: 'toggle' },
              classNameField('line.normal.extended.base'),
            ],
          },
          fontFields('line.normal.extended.base'),
          ...stateFields('line.normal.extended.base', true),
        ],
        children: [
          {
            id: 'line.normal.extended.translate',
            titleKey: 'settings.section.lineNormalExtendedTranslate',
            groups: [
              {
                fields: [
                  { path: 'line.normal.extended.translate.visible', labelKey: 'settings.field.visible', type: 'toggle' },
                  classNameField('line.normal.extended.translate'),
                ],
              },
              fontFields('line.normal.extended.translate'),
              ...stateFields('line.normal.extended.translate', true),
            ],
          },
          {
            id: 'line.normal.extended.roman',
            titleKey: 'settings.section.lineNormalExtendedRoman',
            groups: [
              {
                fields: [
                  { path: 'line.normal.extended.roman.visible', labelKey: 'settings.field.visible', type: 'toggle' },
                  classNameField('line.normal.extended.roman'),
                ],
              },
              fontFields('line.normal.extended.roman'),
              ...stateFields('line.normal.extended.roman', true),
            ],
          },
        ],
      },
      {
        id: 'line.interlude',
        titleKey: 'settings.section.lineInterlude',
        groups: [
          {
            fields: [
              classNameField('line.interlude'),
              { path: 'line.interlude.size', labelKey: 'settings.field.interludeSize', type: 'number', min: 4, max: 64, step: 1 },
            ],
          },
          {
            titleKey: 'settings.group.normalState',
            fields: [
              { path: 'line.interlude.style.normal.color', labelKey: 'settings.field.color', type: 'text', placeholder: 'Inherit' },
              {
                path: 'line.interlude.style.normal.opacity',
                labelKey: 'settings.field.opacity',
                type: 'number',
                placeholder: 'Inherit',
                step: 0.05,
                min: 0,
                max: 1,
              },
              { path: 'line.interlude.style.normal.hide', labelKey: 'settings.field.interludeHide', type: 'toggle' },
            ],
          },
          {
            titleKey: 'settings.group.activeState',
            fields: [
              { path: 'line.interlude.style.active.color', labelKey: 'settings.field.color', type: 'text', placeholder: 'Inherit' },
              {
                path: 'line.interlude.style.active.opacity',
                labelKey: 'settings.field.opacity',
                type: 'number',
                placeholder: 'Inherit',
                step: 0.05,
                min: 0,
                max: 1,
              },
            ],
          },
        ],
      },
    ],
  },
]
