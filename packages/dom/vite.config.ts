import type { Plugin } from 'vite'

import { buildConfig } from '../../private/config/vite'

const cssInlinePlugin = (): Plugin => {
  return {
    name: 'css-inline',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const cssChunks: string[] = []
      const cssFileNames: string[] = []

      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'asset' && fileName.endsWith('.css')) {
          cssChunks.push(chunk.source as string)
          cssFileNames.push(fileName)
          delete bundle[fileName]
        }
      }

      if (cssChunks.length === 0) return

      const cssContent = cssChunks.join('\n')

      const injection = `\n;(function(){try{if(typeof document!=='undefined'){var s=document.createElement("style");s.setAttribute("data-lyric-player","");s.textContent=${JSON.stringify(cssContent)};document.head.appendChild(s)}}catch(e){}})();\n`

      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk' && chunk.isEntry && chunk.fileName.endsWith('.js')) {
          chunk.code += injection
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
