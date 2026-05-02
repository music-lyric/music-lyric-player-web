import type { CommitInfo } from './utils/git'

import { parseArgs } from 'node:util'
import { join } from 'node:path'
import { writeFileSync } from 'node:fs'

import { CHANGE_LOG_FILE, CURRENT_CHANGE_LOG_FILE } from './constant'

import { root, mainVersion } from '../target'
import { getRepoInfo, getCommitInfo, getAllTags, buildContents, buildHeader, formatResult } from './utils'

const { values: args } = parseArgs({
  allowPositionals: true,
  options: {
    current: {
      type: 'boolean',
      default: false,
    },
    showCurrentHead: {
      type: 'boolean',
      default: false,
    },
  },
})

interface VersionEntry {
  head: CommitInfo | null
  list: CommitInfo[]
}

const handleBuild = async (start: string, end: string, repo: { owner: string; name: string }, showHead: boolean = true): Promise<string> => {
  const commits = await getCommitInfo(start, end)

  let key = `v${mainVersion}`

  const wait: Record<string, VersionEntry> = {}

  for (const item of commits) {
    if (item.type === 'release') {
      key = item.message
      // If a bucket already exists for this key (e.g. `mainVersion` happened
      // to match a release commit's version), preserve previously collected
      // commits instead of overwriting them.
      const existing = wait[key]
      wait[key] = {
        head: item,
        list: existing?.list ?? [],
      }
      continue
    }

    if (!key) {
      continue
    }

    if (!wait[key]) {
      wait[key] = {
        head: null,
        list: [],
      }
    }

    wait[key].list.push(item)
  }

  const result: string[] = []

  for (const version in wait) {
    const content = wait[version]

    result.push('\n')

    if (showHead) {
      const head = buildHeader(version, content.head)
      result.push(head)
    }

    const body = buildContents(content.list, repo)
    result.push(...body)
  }

  return formatResult(result.join('\n'))
}

const main = async () => {
  const repo = await getRepoInfo()
  if (!repo) {
    throw new Error('get repo info failed.')
  }

  let result: string
  let file: string

  if (args.current) {
    const [latest, old] = await getAllTags()
    if (!latest) {
      return
    }
    result = await handleBuild(old || '', latest, repo, args.showCurrentHead)
    file = CURRENT_CHANGE_LOG_FILE
  } else {
    // Tags mark the release boundary: commits past the latest tag are
    // unreleased and intentionally excluded from the changelog. With no
    // tag at all, there is nothing released to record.
    const [latest] = await getAllTags()
    if (!latest) {
      console.log('No tags found; skipping changelog generation.')
      return
    }
    result = await handleBuild('', latest, repo)
    file = CHANGE_LOG_FILE
  }

  if (!result) {
    throw new Error('build change log failed.')
  }

  const output = join(root, file)

  writeFileSync(output, result, { encoding: 'utf-8' })
}

main()
