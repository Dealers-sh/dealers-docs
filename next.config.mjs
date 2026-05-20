import nextra from 'nextra'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const projectRoot = dirname(fileURLToPath(import.meta.url))

const withNextra = nextra({
  search: {
    codeblocks: false
  },
  defaultShowCopyCode: true
})

export default withNextra({
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: projectRoot
  },
  async redirects() {
    return [
      { source: '/start', destination: '/start/connect', permanent: false },
      { source: '/the-game', destination: '/the-game/overview', permanent: false },
      { source: '/progression', destination: '/progression/reputation', permanent: false },
      { source: '/the-art', destination: '/the-art/rendering', permanent: false },
      { source: '/contracts', destination: '/contracts/overview', permanent: false }
    ]
  }
})
