import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { valid, gt } from 'semver'

import { parseArgs } from 'node:util'
import { exec } from './utils'
import { rootVersion, root, targets } from './target'

const handleUpdate = async (id: string, root: string, newVersion: string) => {
  try {
    const pkgPath = join(root, 'package.json')
    const pkgContent = await readFile(pkgPath, 'utf-8')
    const pkg = JSON.parse(pkgContent)

    pkg.version = newVersion

    await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
    console.log(`update success id=${id}`)
  } catch (err) {
    console.error(`update failed id=${id} err=${err}`)
    process.exit(1)
  }
}

const main = async () => {
  const { values } = parseArgs({
    options: {
      current: {
        type: 'string',
        short: 'c',
      },
      git: {
        type: 'boolean',
        short: 'g',
        default: false,
      },
      force: {
        type: 'boolean',
        short: 'f',
        default: false,
      },
    },
    strict: false,
  })

  const newVersion = values.current

  if (!newVersion || typeof newVersion !== 'string') {
    console.error('please give target version, use --current 1.14.514')
    process.exit(1)
  }

  if (!valid(newVersion)) {
    console.error(`bad target version`)
    process.exit(1)
  }

  if (!gt(newVersion, rootVersion) && !values.force) {
    console.log(`bad target version, old=${rootVersion} new=${newVersion}`)
    process.exit(0)
  }

  console.log(`prepare: ${rootVersion} -> ${newVersion}`)
  console.log('\n')

  handleUpdate('root', root, newVersion)
  for (const target of targets) {
    handleUpdate(target.id, target.root, newVersion)
  }

  console.log('\n')
  console.log('build change-log')
  try {
    await exec('pnpm', ['run', 'change-log:build'], {
      stdio: 'ignore',
      cwd: process.cwd(),
    })
    console.log(`build change-log success`)
  } catch (err) {
    console.error(`build change-log failed err=${err}`)
    process.exit(1)
  }

  if (!values.git) {
    process.exit(0)
  }

  console.log('\n')
  console.log('build git info')
  try {
    await exec('git', ['add', '.'], {
      stdio: 'inherit',
      cwd: process.cwd(),
    })
    await exec('git', ['commit', '-m', `"release: v${newVersion}"`], {
      stdio: 'inherit',
      cwd: process.cwd(),
    })
    await exec('git', ['tag', `v${newVersion}`], {
      stdio: 'inherit',
      cwd: process.cwd(),
    })
    console.log(`build git info success`)
  } catch (err) {
    console.error(`build git info failed err=${err}`)
    process.exit(1)
  }
}

main()
