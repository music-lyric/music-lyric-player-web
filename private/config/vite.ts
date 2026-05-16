import type { UserConfig, Plugin } from 'vite'

import { join } from 'node:path'
import { defineConfig, mergeConfig } from 'vite'

import PluginDts from 'vite-plugin-dts'

const root = join(process.cwd())
const src = join(root, 'src')

const external: string[] = ['@music-lyric-player', 'lodash-es']

const formatMap: Record<string, string> = {
  cjs: 'comm',
  es: 'ecma',
}

const common = defineConfig({
  root,
  build: {
    lib: {
      entry: join(src, 'index.ts'),
      formats: ['es', 'cjs'],
      fileName(format, entryName) {
        const target = formatMap[format] || format
        return `index.${target}.js`
      },
    },
    rollupOptions: {
      external(source, importer, isResolved) {
        for (const name of external) {
          if (source.includes(name)) {
            return true
          }
        }
        return false
      },
    },
    outDir: join(root, 'dist'),
    minify: 'esbuild',
    reportCompressedSize: false,
    emptyOutDir: true,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@root': src,
    },
  },
})

const dts = defineConfig({
  plugins: [
    PluginDts({
      rollupTypes: true,
    }),
  ],
})

const css = defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[local]-[hash:hex:6]',
    },
  },
})

interface Params {
  custom?: UserConfig
  withDts?: boolean
  withCss?: boolean
  withCommon?: boolean
}

export const buildConfig = ({ custom = {}, withDts = true, withCss = false, withCommon = true }: Params) => {
  let result = defineConfig({})

  if (withCommon) {
    result = mergeConfig(result, common)
  }

  if (withDts) {
    result = mergeConfig(result, dts)
  }
  if (withCss) {
    result = mergeConfig(result, css)
  }

  if (custom) {
    result = mergeConfig(result, custom)
  }

  return result
}

export const CssInlinePlugin = (name: string): Plugin => {
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
          chunk.code = `globalThis.${name} = ${JSON.stringify(styleContent)};` + `\n\n` + chunk.code
          break
        }
      }
    },
  }
}
