import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = join(ROOT, 'content/agents/skill.mdx')
const TARGET = join(ROOT, 'public/skill.md')
const DOCS_ORIGIN = 'https://docs.dealers.sh'

const source = readFileSync(SOURCE, 'utf8')

const frontmatter = source.match(/^```yaml\n([\s\S]*?)\n```\n/m)
if (!frontmatter) {
  throw new Error(`No agent-side yaml frontmatter block found in ${SOURCE}`)
}

const body = source.slice(frontmatter.index + frontmatter[0].length).trimStart()

const raw = ['---', frontmatter[1], '---', '', '# Dealers.sh', '', body]
  .join('\n')
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>')
  .replaceAll('&amp;', '&')
  .replace(/(\]\(|`)(\/(?:contracts|the-game|progression|start|agents|patch-notes)\/[a-z0-9-]+)/g, `$1${DOCS_ORIGIN}$2`)

writeFileSync(TARGET, raw)
console.log(`Wrote ${TARGET} (${raw.split('\n').length} lines) from content/agents/skill.mdx`)
