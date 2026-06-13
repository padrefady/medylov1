'use client';

import { Home, Search, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/search', icon: Search, label: 'Recherche' },
    { href: '/garde', icon: Shield, label: 'De Garde' },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`flex flex-col items-center gap-1 ${isActive ? 'text-med-blue' : 'text-gray-400'}`}>
              <link.icon size={24} />
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}