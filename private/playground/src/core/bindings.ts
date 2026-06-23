import type { BaseLyricPlayerConfig, DomLyricPlayerConfig } from 'music-lyric-player'

export type FieldType = 'number' | 'text' | 'select' | 'toggle' | 'padding' | 'order'

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
  showWhen?: (cfg: { base?: Partial<BaseLyricPlayerConfig.Root>; dom?: Partial<DomLyricPlayerConfig.Root> }) => boolean
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

const DRIVER_MODES: SelectOption[] = [
  { value: 'animation', labelKey: 'settings.field.driverAnimation' },
  { value: 'timer', labelKey: 'settings.field.driverTimer' },
]

// The draggable slots of a normal line; the field value is a top-to-bottom permutation of these tokens.
const LINE_SLOTS: SelectOption[] = [
  { value: 'main', labelKey: 'settings.field.lineSlotMain' },
  { value: 'annotation-translate', labelKey: 'settings.field.lineSlotTranslate' },
  { value: 'annotation-roman', labelKey: 'settings.field.lineSlotRoman' },
]

const MAIN_USE_MODES: SelectOption[] = [
  { value: 'syllable', labelKey: 'settings.field.mainUseSyllable' },
  { value: 'plain', labelKey: 'settings.field.mainUsePlain' },
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

export const BASE_SECTIONS: SectionBinding[] = [
  {
    id: 'base.player',
    titleKey: 'settings.section.basePlayer',
    groups: [
      {
        fields: [
          { path: 'base.driver', labelKey: 'settings.field.driver', type: 'select', options: DRIVER_MODES },
          { path: 'base.bridgeActive', labelKey: 'settings.field.bridgeActive', type: 'toggle' },
          { path: 'base.mergeWindow', labelKey: 'settings.field.mergeWindow', type: 'number', min: 0, max: 2000, step: 50 },
          { path: 'base.mergeLimit', labelKey: 'settings.field.mergeLimit', type: 'number', min: 0, max: 50, step: 1 },
        ],
      },
      {
        titleKey: 'settings.group.offset',
        fields: [
          { path: 'base.offset.global', labelKey: 'settings.field.offsetGlobal', type: 'number', min: -5000, max: 5000, step: 50 },
          { path: 'base.offset.useMeta', labelKey: 'settings.field.offsetUseMeta', type: 'toggle' },
          { path: 'base.offset.resetTempOnLyricChange', labelKey: 'settings.field.offsetResetTemp', type: 'toggle' },
        ],
      },
    ],
  },
]

export const DOM_SECTIONS: SectionBinding[] = [
  {
    id: 'dom.container',
    titleKey: 'settings.section.container',
    groups: [
      {
        fields: [
          { path: 'dom.container.className', labelKey: 'settings.field.className', type: 'text', placeholder: '""' },
          { path: 'dom.container.padding', labelKey: 'settings.field.padding', type: 'padding' },
        ],
      },
      {
        titleKey: 'settings.group.edgeFade',
        fields: [
          { path: 'dom.container.fade.enabled', labelKey: 'settings.field.enabled', type: 'toggle' },
          { path: 'dom.container.fade.top', labelKey: 'settings.field.fadeTop', type: 'text' },
          { path: 'dom.container.fade.bottom', labelKey: 'settings.field.fadeBottom', type: 'text' },
        ],
      },
    ],
  },
  {
    id: 'dom.layout',
    titleKey: 'settings.section.layout',
    groups: [
      {
        fields: [
          {
            path: 'dom.layout.align',
            labelKey: 'settings.field.align',
            type: 'select',
            options: [
              { value: 'left', labelKey: 'settings.field.alignLeft' },
              { value: 'center', labelKey: 'settings.field.alignCenter' },
              { value: 'right', labelKey: 'settings.field.alignRight' },
            ],
          },
          { path: 'dom.layout.gap', labelKey: 'settings.field.lineGap', type: 'number', min: 0, max: 200, step: 1 },
        ],
      },
    ],
  },
  {
    id: 'dom.effect',
    titleKey: 'settings.section.effect',
    groups: [
      {
        titleKey: 'settings.group.scale',
        fields: [
          { path: 'dom.effect.scale.enabled', labelKey: 'settings.field.enabled', type: 'toggle' },
          { path: 'dom.effect.scale.min', labelKey: 'settings.field.scaleMin', type: 'number', min: 0, max: 1, step: 0.05 },
          { path: 'dom.effect.scale.max', labelKey: 'settings.field.scaleMax', type: 'number', min: 0, max: 1, step: 0.05 },
        ],
      },
      {
        titleKey: 'settings.group.blur',
        fields: [
          { path: 'dom.effect.blur.enabled', labelKey: 'settings.field.enabled', type: 'toggle' },
          { path: 'dom.effect.blur.min', labelKey: 'settings.field.blurMin', type: 'number', min: 0, max: 20, step: 0.1 },
          { path: 'dom.effect.blur.max', labelKey: 'settings.field.blurMax', type: 'number', min: 0, max: 20, step: 0.1 },
        ],
      },
    ],
  },
  {
    id: 'dom.scroll',
    titleKey: 'settings.section.scroll',
    groups: [
      {
        fields: [{ path: 'dom.scroll.anchor', labelKey: 'settings.field.scrollAnchor', type: 'number', min: 0, max: 100, step: 1 }],
      },
      {
        titleKey: 'settings.group.animation',
        fields: [
          { path: 'dom.scroll.animation.mode', labelKey: 'settings.field.scrollMode', type: 'select', options: SCROLL_MODES },
          { path: 'dom.scroll.animation.duration', labelKey: 'settings.field.scrollDuration', type: 'number', min: 0, max: 2000, step: 50 },
          { path: 'dom.scroll.animation.easing', labelKey: 'settings.field.scrollEasing', type: 'text' },
          {
            path: 'dom.scroll.animation.delay',
            labelKey: 'settings.field.scrollDelay',
            type: 'number',
            min: 0,
            max: 1000,
            step: 10,
            showWhen: (c) => ((c.dom?.scroll?.animation as any)?.mode ?? 'smooth') === 'smooth',
          },
          {
            path: 'dom.scroll.animation.range',
            labelKey: 'settings.field.scrollRange',
            type: 'number',
            min: 1,
            max: 30,
            step: 1,
            showWhen: (c) => ((c.dom?.scroll?.animation as any)?.mode ?? 'smooth') !== 'smooth',
          },
          {
            path: 'dom.scroll.animation.step',
            labelKey: 'settings.field.scrollStep',
            type: 'number',
            min: 1,
            max: 200,
            step: 1,
            showWhen: (c) => ((c.dom?.scroll?.animation as any)?.mode ?? 'smooth') !== 'smooth',
          },
        ],
      },
    ],
  },
  {
    id: 'dom.line',
    titleKey: 'settings.section.line',
    groups: [
      {
        fields: [
          classNameField('dom.line'),
          { path: 'dom.line.normal.sort', labelKey: 'settings.field.lineSort', type: 'order', options: LINE_SLOTS },
        ],
      },
    ],
    children: [
      {
        id: 'dom.line.normal.base',
        titleKey: 'settings.section.lineNormalBase',
        groups: [
          fontFields('dom.line.normal.base'),
          ...stateFields('dom.line.normal.base', true),
        ],
      },
      {
        id: 'dom.line.normal.main',
        titleKey: 'settings.section.lineNormalMain',
        groups: [
          {
            fields: [
              { path: 'dom.line.normal.main.use', labelKey: 'settings.field.mainUse', type: 'select', options: MAIN_USE_MODES },
            ],
          },
          fontFields('dom.line.normal.main.syllable'),
          ...stateFields('dom.line.normal.main.syllable', true),
          {
            titleKey: 'settings.group.floatAnimation',
            fields: [
              { path: 'dom.line.normal.main.syllable.animation.float.enabled', labelKey: 'settings.field.enabled', type: 'toggle' },
              {
                path: 'dom.line.normal.main.syllable.animation.float.from',
                labelKey: 'settings.field.floatFrom',
                type: 'number',
                step: 0.5,
                min: -50,
                max: 50,
              },
              {
                path: 'dom.line.normal.main.syllable.animation.float.to',
                labelKey: 'settings.field.floatTo',
                type: 'number',
                step: 0.5,
                min: -50,
                max: 50,
              },
            ],
          },
          {
            titleKey: 'settings.group.maskAnimation',
            fields: [
              { path: 'dom.line.normal.main.syllable.animation.mask.enabled', labelKey: 'settings.field.enabled', type: 'toggle' },
              {
                path: 'dom.line.normal.main.syllable.animation.mask.feather.normal',
                labelKey: 'settings.field.maskFeatherNormal',
                type: 'number',
                min: 0,
                max: 2,
                step: 0.05,
              },
              {
                path: 'dom.line.normal.main.syllable.animation.mask.feather.first',
                labelKey: 'settings.field.maskFeatherFirst',
                type: 'number',
                min: 0,
                max: 5,
                step: 0.05,
              },
              {
                path: 'dom.line.normal.main.syllable.animation.mask.feather.last',
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
              { path: 'dom.line.normal.main.syllable.animation.emphasize.enabled', labelKey: 'settings.field.enabled', type: 'toggle' },
              {
                path: 'dom.line.normal.main.syllable.animation.emphasize.minDuration',
                labelKey: 'settings.field.emphasizeMinDuration',
                type: 'number',
                min: 0,
                max: 5000,
                step: 100,
              },
              {
                path: 'dom.line.normal.main.syllable.animation.emphasize.disablePlaybackRate',
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
              { path: 'dom.line.normal.main.syllable.animation.emphasize.effects.main.enabled', labelKey: 'settings.field.enabled', type: 'toggle' },
              {
                path: 'dom.line.normal.main.syllable.animation.emphasize.effects.main.scale',
                labelKey: 'settings.field.emphasizeMainScale',
                type: 'number',
                min: 0,
                max: 1,
                step: 0.01,
              },
              {
                path: 'dom.line.normal.main.syllable.animation.emphasize.effects.main.offsetHorizontal',
                labelKey: 'settings.field.emphasizeMainOffsetH',
                type: 'number',
                min: 0,
                max: 20,
                step: 0.1,
              },
              {
                path: 'dom.line.normal.main.syllable.animation.emphasize.effects.main.offsetVertical',
                labelKey: 'settings.field.emphasizeMainOffsetV',
                type: 'number',
                min: 0,
                max: 20,
                step: 0.1,
              },
              {
                path: 'dom.line.normal.main.syllable.animation.emphasize.effects.main.easingRise',
                labelKey: 'settings.field.emphasizeMainEasingRise',
                type: 'text',
              },
              {
                path: 'dom.line.normal.main.syllable.animation.emphasize.effects.main.easingFall',
                labelKey: 'settings.field.emphasizeMainEasingFall',
                type: 'text',
              },
            ],
          },
          {
            titleKey: 'settings.group.emphasizeGlow',
            fields: [
              { path: 'dom.line.normal.main.syllable.animation.emphasize.effects.glow.enabled', labelKey: 'settings.field.enabled', type: 'toggle' },
              {
                path: 'dom.line.normal.main.syllable.animation.emphasize.effects.glow.color',
                labelKey: 'settings.field.emphasizeGlowColor',
                type: 'text',
              },
              {
                path: 'dom.line.normal.main.syllable.animation.emphasize.effects.glow.maxRadius',
                labelKey: 'settings.field.emphasizeGlowMaxRadius',
                type: 'number',
                min: 0,
                max: 50,
                step: 0.5,
              },
              {
                path: 'dom.line.normal.main.syllable.animation.emphasize.effects.glow.maxAlpha',
                labelKey: 'settings.field.emphasizeGlowMaxAlpha',
                type: 'number',
                min: 0,
                max: 1,
                step: 0.05,
              },
              {
                path: 'dom.line.normal.main.syllable.animation.emphasize.effects.glow.easing',
                labelKey: 'settings.field.emphasizeGlowEasing',
                type: 'text',
              },
            ],
          },
          {
            titleKey: 'settings.group.emphasizeFloat',
            fields: [
              { path: 'dom.line.normal.main.syllable.animation.emphasize.effects.float.enabled', labelKey: 'settings.field.enabled', type: 'toggle' },
              {
                path: 'dom.line.normal.main.syllable.animation.emphasize.effects.float.amplitude',
                labelKey: 'settings.field.emphasizeFloatAmplitude',
                type: 'number',
                min: 0,
                max: 20,
                step: 0.5,
              },
              {
                path: 'dom.line.normal.main.syllable.animation.emphasize.effects.float.duration.scale',
                labelKey: 'settings.field.emphasizeFloatDurationScale',
                type: 'number',
                min: 0,
                max: 5,
                step: 0.1,
              },
              {
                path: 'dom.line.normal.main.syllable.animation.emphasize.effects.float.duration.lead',
                labelKey: 'settings.field.emphasizeFloatDurationLead',
                type: 'number',
                min: 0,
                max: 2000,
                step: 50,
              },
              {
                path: 'dom.line.normal.main.syllable.animation.emphasize.effects.float.easing',
                labelKey: 'settings.field.emphasizeFloatEasing',
                type: 'text',
              },
            ],
          },
        ],
      },
      {
        id: 'dom.line.normal.annotation',
        titleKey: 'settings.section.lineNormalAnnotation',
        groups: [
          {
            fields: [
              { path: 'dom.line.normal.annotation.visible', labelKey: 'settings.field.visible', type: 'toggle' },
            ],
          },
          fontFields('dom.line.normal.annotation.base'),
          ...stateFields('dom.line.normal.annotation.base', true),
        ],
        children: [
          {
            id: 'dom.line.normal.annotation.translate',
            titleKey: 'settings.section.lineNormalAnnotationTranslate',
            groups: [
              {
                fields: [
                  { path: 'dom.line.normal.annotation.translate.visible', labelKey: 'settings.field.visible', type: 'toggle' },
                ],
              },
              fontFields('dom.line.normal.annotation.translate'),
              ...stateFields('dom.line.normal.annotation.translate', true),
            ],
          },
          {
            id: 'dom.line.normal.annotation.roman',
            titleKey: 'settings.section.lineNormalAnnotationRoman',
            groups: [
              {
                fields: [
                  { path: 'dom.line.normal.annotation.roman.visible', labelKey: 'settings.field.visible', type: 'toggle' },
                ],
              },
              fontFields('dom.line.normal.annotation.roman'),
              ...stateFields('dom.line.normal.annotation.roman', true),
            ],
          },
        ],
      },
      {
        id: 'dom.line.interlude',
        titleKey: 'settings.section.lineInterlude',
        groups: [
          {
            fields: [
              { path: 'dom.line.interlude.size', labelKey: 'settings.field.interludeSize', type: 'number', min: 4, max: 64, step: 1 },
            ],
          },
          {
            titleKey: 'settings.group.normalState',
            fields: [
              { path: 'dom.line.interlude.style.normal.color', labelKey: 'settings.field.color', type: 'text' },
              { path: 'dom.line.interlude.style.normal.opacity', labelKey: 'settings.field.opacity', type: 'number', step: 0.05, min: 0, max: 1 },
              { path: 'dom.line.interlude.style.normal.hide', labelKey: 'settings.field.interludeHide', type: 'toggle' },
            ],
          },
          {
            titleKey: 'settings.group.activeState',
            fields: [
              { path: 'dom.line.interlude.style.active.color', labelKey: 'settings.field.color', type: 'text' },
              { path: 'dom.line.interlude.style.active.opacity', labelKey: 'settings.field.opacity', type: 'number', step: 0.05, min: 0, max: 1 },
            ],
          },
        ],
      },
    ],
  },
]
