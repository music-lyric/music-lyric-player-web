import { join } from 'node:path'

import { buildConfig } from '../config/vite'

import PathPlugin from 'vite-tsconfig-paths'

const root = join(process.cwd(), '..', '..')
const src = join(process.cwd(), 'src')

export default buildConfig({
  custom: {
    root: src,
    plugins: [PathPlugin({ root })],
    resolve: {
      alias: [
        {
          find: /^@music-lyric-player\/(.*?)$/,
          replacement: join(root, 'packages', '$1', 'src', 'index.ts'),
        },
      ],
    },
    build: {
      lib: {
        entry: join(src, 'index.ts'),
      },
      minify: false,
      reportCompressedSize: false,
    },
    server: {
      port: 9090,
      strictPort: false,
    },
  },
  withDts: false,
  withCommon: false,
})
