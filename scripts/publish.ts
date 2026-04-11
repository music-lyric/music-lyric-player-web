import { exec } from './utils'
import { mainVersion, targets } from './target'

const main = async () => {
  let releaseTag: string | null = null
  if (mainVersion.includes('alpha')) {
    releaseTag = 'alpha'
  } else if (mainVersion.includes('beta')) {
    releaseTag = 'beta'
  }

  for (const target of targets) {
    try {
      console.log(`try publish for ${target.id}`)

      const args = ['publish', '--no-git-checks', '--access', 'public', ...(releaseTag ? ['--tag', releaseTag] : [])]
      await exec('pnpm', args, {
        stdio: 'inherit',
        cwd: target.root,
      })

      console.log(`publish success for ${target.id}`)
    } catch (err) {
      console.log(`publish for ${target.id}`)
    }
  }
}

main()
