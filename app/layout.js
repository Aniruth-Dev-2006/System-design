import { Inter, Fustat } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const fustat = Fustat({ subsets: ['latin'], variable: '--font-fustat' })

export const metadata = {
  title: 'AI System Design Interview',
  description: 'Interactive Agentic AI System Design Interview Platform',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fustat.variable}`}>{children}</body>
    </html>
  )
}
