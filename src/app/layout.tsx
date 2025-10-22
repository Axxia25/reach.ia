import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/providers/theme-provider'

export const metadata: Metadata = {
  title: 'Dashboard Leads - Gestão de Leads',
  description: 'Sistema de gestão e acompanhamento de leads em tempo real',
  keywords: ['leads', 'dashboard', 'vendas', 'gestão'],
  authors: [{ name: 'Dashboard Leads Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
