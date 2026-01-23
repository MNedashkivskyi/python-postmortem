import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Postmortem Writer",
  description: "AI-powered incident postmortem generator",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${jetbrainsMono.variable} font-mono bg-background text-foreground min-h-screen`}>
        <div className="flex flex-col min-h-screen">
          <header className="border-b border-border bg-card">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2">
                <span className="text-primary text-xl font-bold">&gt;_</span>
                <span className="text-lg font-semibold">Postmortem Writer</span>
              </a>
              <nav className="flex items-center gap-6">
                <a href="/" className="text-sm hover:text-primary">New</a>
                <a href="/history" className="text-sm hover:text-primary">History</a>
              </nav>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-border py-4">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              Postmortem Writer v1.0.0
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
