import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

export const metadata = {
  title: 'GSA GESTÃO',
  description: 'Sistema de Gestão Ágil',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}