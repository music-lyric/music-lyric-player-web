import type { Plugin } from 'vite'

import { join } from 'node:path'
import { readFileSync } from 'node:fs'

import VuePlugin from '@vitejs/plugin-vue'
import PathPlugin from 'vite-tsconfig-paths'
import { buildConfig } from '../config/vite'

const cwd = process.cwd()
const src = join(cwd, 'src')
const workspace = join(cwd, '..', '..')

const rootPkg = JSON.parse(readFileSync(join(workspace, 'package.json'), 'utf-8')) as { version: string }

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

export default buildConfig({
  withCommon: false,
  withDts: false,
  withCss: true,
  custom: {
    root: src,
    base: './',
    build: {
      outDir: join(cwd, 'dist'),
      target: 'esnext',
      modulePreload: {
        polyfill: false,
      },
      emptyOutDir: true,
      sourcemap: true,
      minify: false,
    },
    server: {
      port: 9091,
      strictPort: false,
    },
    plugins: [VuePlugin(), Alias(), PathPlugin()],
    define: {
      __APP_VERSION__: JSON.stringify(rootPkg.version),
    },
    resolve: {
      alias: [
        {
          find: /^music-lyric-player$/,
          replacement: join(workspace, 'main', 'src', 'index.ts'),
        },
        {
          find: /^@music-lyric-player\/(.*?)$/,
          replacement: join(workspace, 'packages', '$1', 'src', 'index.ts'),
        },
      ],
    },
  },
})
