import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { Header } from '@/components/layout/header'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Postmortem Writer',
  description: 'AI-powered incident postmortem document generator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${jetbrainsMono.variable} font-mono min-h-screen bg-background text-foreground`}>
        <TooltipProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-1">
              {children}
            </div>
            <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground">
              <span className="text-primary">$</span> postmortem_writer v1.0.0
            </footer>
          </div>
        </TooltipProvider>
      </body>
    </html>
  )
}
