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
      <body style={{ margin: 0, padding: 0, backgroundColor: '#050505' }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}