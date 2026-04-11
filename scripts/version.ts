import { parseArgs } from 'node:util'
import fs from 'node:fs/promises'
import path from 'node:path'
import semver from 'semver'
import { exec } from './utils'
import { mainVersion, targets } from './target'

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

  if (!semver.valid(newVersion)) {
    console.error(`bad target version`)
    process.exit(1)
  }

  if (!semver.gt(newVersion, mainVersion) && !values.force) {
    console.log(`bad target version, old=${mainVersion} new=${newVersion}`)
    process.exit(0)
  }

  console.log(`prepare: ${mainVersion} -> ${newVersion}`)
  console.log('\n')

  for (const target of targets) {
    try {
      const pkgPath = path.join(target.root, 'package.json')
      const pkgContent = await fs.readFile(pkgPath, 'utf-8')
      const pkg = JSON.parse(pkgContent)

      pkg.version = newVersion

      await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
      console.log(`update success id=${target.id}`)
    } catch (err) {
      console.error(`update failed id=${target.id} err=${err}`)
      process.exit(1)
    }
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
