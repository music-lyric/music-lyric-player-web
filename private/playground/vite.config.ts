import { join } from 'node:path'

import { defineConfig, type Plugin } from 'vite'

import VuePlugin from '@vitejs/plugin-vue'
import PathPlugin from 'vite-tsconfig-paths'

const cwd = process.cwd()
const src = join(cwd, 'src')
const workspace = join(cwd, '..', '..')

const Alias = (): Plugin => {
  const playgroundSrc = src.replace(/\\/g, '/')
  return {
    name: 'playground-root-alias',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!source.startsWith('@root/') || !importer) return null
      const normalized = importer.replace(/\\/g, '/')
      if (!normalized.startsWith(playgroundSrc + '/')) return null
      const rewritten = join(src, source.slice('@root/'.length))
      const result = await this.resolve(rewritten, importer, { ...options, skipSelf: true })
      return result?.id ?? null
    },
  }
}

export default defineConfig({
  root: src,
  plugins: [VuePlugin(), Alias(), PathPlugin()],
  resolve: {
    alias: [
      {
        find: /^@music-lyric-player\/(.*?)$/,
        replacement: join(workspace, 'packages', '$1', 'src', 'index.ts'),
      },
    ],
  },
  server: {
    port: 9090,
    strictPort: false,
  },
})
