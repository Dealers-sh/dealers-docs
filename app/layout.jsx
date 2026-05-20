import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { Inter, Source_Code_Pro, Fira_Mono } from 'next/font/google'
import 'nextra-theme-docs/style.css'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-source-code'
})

const firaMono = Fira_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '700'],
  variable: '--font-fira-mono'
})

export const metadata = {
  metadataBase: new URL('https://docs.dealers.sh'),
  title: {
    default: 'Dealers.sh Docs',
    template: '%s · Dealers.sh Docs'
  },
  description: 'A 100% on-chain mafia strategy game powered by dynamic NFTs. Read the contract.',
  applicationName: 'Dealers.sh Docs',
  generator: 'Nextra',
  appleWebApp: { title: 'Dealers.sh Docs' },
  openGraph: {
    url: './',
    siteName: 'Dealers.sh Docs',
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    site: '@dealers_sh'
  },
  alternates: { canonical: './' }
}

function DocsLogo() {
  return (
    <span className="docs-logo-link" aria-label="Dealers.sh Docs">
      <svg
        className="docs-logo-svg"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 168 30"
        role="img"
        aria-hidden="true"
      >
        <path fill="red" d="M11.364 0c-.214 0-.421.019-.622.056V0h.622Zm22.103.057V0h-.622c.213 0 .42.02.622.057Zm9.586 3.733v.984h-4.3V3.79h4.3ZM48.962 0c-.214 0-.42.019-.622.056V0h.622Zm5.368 0c.213 0 .42.02.621.057V0h-.621Z" />
        <path fill="red" d="M48.34.056c.201-.037.408-.056.622-.056h5.368c.213 0 .42.02.621.057.227.043.447.11.66.203.406.173.758.409 1.056.707.3.299.535.651.708 1.057.173.4.26.828.26 1.281v19.058h13.43V23.6h-13.43v5.653h-1.236V23.6H9.295v5.652H8.058V23.6H0v-1.237h8.058V3.305c0-.453.087-.88.26-1.28.173-.407.41-.759.708-1.058a3.346 3.346 0 0 1 1.716-.91c.201-.038.408-.057.622-.057h21.481c.213 0 .42.02.622.057.227.043.447.11.659.203a3.33 3.33 0 0 1 1.057.707c.298.299.534.651.708 1.057.173.4.26.828.26 1.281v3.583h-1.237V3.305a2.025 2.025 0 0 0-.609-1.46 2.025 2.025 0 0 0-1.46-.61H11.364a2.046 2.046 0 0 0-.806.162 2.064 2.064 0 0 0-1.263 1.908v19.058h47.104V3.305a2.025 2.025 0 0 0-.61-1.46 2.024 2.024 0 0 0-1.46-.61h-5.367a2.046 2.046 0 0 0-.806.162 2.065 2.065 0 0 0-1.263 1.908v3.583h-1.236V3.305c0-.453.086-.88.26-1.28a3.29 3.29 0 0 1 .707-1.058 3.347 3.347 0 0 1 1.716-.91Z" />
        <path fill="currentColor" d="M16.735 12.92H11.36v3.359h42.973v-3.36H16.735Zm66.315 1.999V2.625h5.27V14.92h-5.27Z" />
        <path fill="currentColor" d="M88.316 8.772V2.625h5.268v6.147h-5.268Zm5.264 6.147V8.772h5.27v6.147h-5.27Zm14.047 0V2.625h5.268V14.92h-5.268Z" />
        <path fill="currentColor" d="M112.892 8.772V2.625h5.269v6.147h-5.269Z" />
        <path fill="currentColor" d="M118.157 14.919V2.625h5.269V14.92h-5.269Zm14.046 0V2.625h5.269V14.92h-5.269Z" />
        <path fill="currentColor" d="M137.468 8.772V2.625h5.269v6.147h-5.269Z" />
        <path fill="currentColor" d="M142.733 8.772V2.625h5.269v6.147h-5.269Zm14.047 6.147V2.625h5.268V14.92h-5.268Z" />
        <path fill="currentColor" d="M162.045 8.772V2.625h5.268v6.147h-5.268ZM83.05 26.627V14.332h5.27v12.293h-5.27Z" />
        <path fill="currentColor" d="M88.316 26.627V20.48h5.268v6.146h-5.268Zm5.264-6.147v-6.147h5.27v6.147h-5.27Zm14.047 6.147V14.332h5.268v12.293h-5.268Z" />
        <path fill="currentColor" d="M112.892 26.627V20.48h5.269v6.146h-5.269Z" />
        <path fill="currentColor" d="M118.157 26.627V14.332h5.269v12.293h-5.269Zm14.046 0V14.332h5.269v12.293h-5.269Z" />
        <path fill="currentColor" d="M137.468 26.627V20.48h5.269v6.146h-5.269Z" />
        <path fill="currentColor" d="M142.733 26.627V20.48h5.269v6.146h-5.269Zm14.047 0V20.48h5.268v6.146h-5.268Z" />
        <path fill="currentColor" d="M162.045 26.627V14.332h5.268v12.293h-5.268Z" />
      </svg>
    </span>
  )
}

const navbar = (
  <Navbar
    logo={<DocsLogo />}
    projectLink="https://github.com/dealers-sh"
    chatLink="https://x.com/dealers_sh"
  />
)

const footer = (
  <Footer>
    <span className="dealers-footer">
      No servers. No storage. No hosting. Powered and rendered on Abstract.
      <br />
      <span className="dealers-footer-muted">
        © {new Date().getFullYear()} Dealers.sh · <a href="/tos">/tos</a> · <a href="/privacy">/privacy</a>
      </span>
    </span>
  </Footer>
)

export default async function RootLayout({ children }) {
  const fontClass = `${inter.variable} ${sourceCodePro.variable} ${firaMono.variable}`
  return (
    <html lang="en" dir="ltr" className={fontClass} suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          footer={footer}
          editLink="Edit this page on GitHub"
          docsRepositoryBase="https://github.com/dealers-sh/dealers-docs/blob/main"
          sidebar={{ defaultMenuCollapseLevel: 1, toggleButton: true }}
          pageMap={await getPageMap()}
          feedback={{ content: null }}
          themeSwitch={{ dark: 'Dark', light: 'Light', system: 'System' }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
