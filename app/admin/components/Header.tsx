'use client'

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';
import Image from 'next/image';

export function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // First remove the cookie
      Cookies.remove('adminAuthenticated', { path: '/' });
      
      // Then call the logout API endpoint
      await fetch('/api/admin/auth', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Force a router refresh and redirect
      router.refresh();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div className="relative w-[150px] h-[60px]">
        <Image
          src="/topdeal.svg"
          alt="TopDeal Logo"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
      <Button
        variant="ghost"
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        onClick={handleLogout}
      >
        <LogOut size={18} />
        Logout
      </Button>
    </header>
  );
} 