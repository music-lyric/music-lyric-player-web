import { buildConfig, CssInlinePlugin } from '../../private/config/vite'

export default buildConfig({
  withCss: true,
  custom: {
    plugins: [CssInlinePlugin('__LYRIC_PLAYER_STYLE__')],
  },
})
