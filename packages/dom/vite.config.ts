import type { Plugin } from 'vite'

import { buildConfig } from '../../private/config/vite'

const css: Plugin = {
  name: 'css-inline',
  apply: 'build',
  enforce: 'post',
  generateBundle(_options, bundle) {
    const cssChunks: string[] = []
    const cssFileNames: string[] = []

    for (const [fileName, chunk] of Object.entries(bundle)) {
      if (fileName.endsWith('.css') && chunk.type === 'asset') {
        cssChunks.push(chunk.source as string)
        cssFileNames.push(fileName)
      }
    }

    if (cssChunks.length === 0) return

    const cssContent = cssChunks.join('\n')

    for (const fileName of cssFileNames) {
      delete bundle[fileName]
    }

    const injection = `;(function(){try{var s=document.createElement("style");s.setAttribute("data-lyric-player","");s.textContent=${JSON.stringify(cssContent)};document.head.appendChild(s)}catch(e){}})()`

    for (const [fileName, chunk] of Object.entries(bundle)) {
      if (chunk.type === 'chunk' && fileName.endsWith('.js')) {
        chunk.code += '\n' + injection + '\n'
      }
    }
  },
}

export default buildConfig({
  custom: {
    plugins: [css],
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
    },
  },
})
