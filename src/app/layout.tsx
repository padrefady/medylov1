import type { Metadata } from 'next'
import './globals.css'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'Medylo - La Santé Plus Proche',
  description: 'Annuaire des pharmacies de Yaoundé, Cameroun',
  icons: {
    icon: '/logo-medylo.png', // C'est ici qu'on dit d'utiliser ton logo !
  },
}



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-med-bg text-gray-800">
        <header className="bg-med-blue text-white p-4 sticky top-0 z-40 shadow-md flex items-center justify-center gap-3">
          {/* Ajout du logo */}
          <img 
            src="/logo-medylo.png" 
            alt="Logo Medylo" 
            className="h-10 w-auto drop-shadow-md" 
          />
          <div>
            <h1 className="text-xl font-bold leading-tight">Medylo</h1>
            <p className="text-xs text-blue-100">La Santé Plus Proche</p>
          </div>
        </header>
        
        <main className="pb-20 max-w-4xl mx-auto">
          {children}
        </main>
        
        <BottomNav />
      </body>
    </html>
  )
}