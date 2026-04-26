import type { Plugin } from 'vite'

import { buildConfig } from '../../private/config/vite'

const cssInlinePlugin = (): Plugin => {
  return {
    name: 'css-inline',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const styleChunks: string[] = []
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'asset' && fileName.endsWith('.css')) {
          styleChunks.push(chunk.source as string)
          delete bundle[fileName]
        }
      }
      if (!styleChunks.length) {
        return
      }

      const styleContent = styleChunks.join('\n')
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk' && chunk.isEntry && chunk.fileName.endsWith('.js')) {
          chunk.code = `const __LYRIC_PLAYER_STYLE__ = ${JSON.stringify(styleContent)};\n\n` + chunk.code
          break
        }
      }
    },
  }
}

export default buildConfig({
  custom: {
    plugins: [cssInlinePlugin()],
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
    },
  },
})
