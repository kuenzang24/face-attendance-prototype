import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Face Recognition Clock-In MVP',
  description: 'Employee attendance system with Face++ passive liveness detection',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Face Recognition Clock-In</h1>
            <div className="space-x-4">
              <a href="/" className="hover:underline">Dashboard</a>
              <a href="/register" className="hover:underline">Register</a>
              <a href="/clockin" className="hover:underline">Clock In</a>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
