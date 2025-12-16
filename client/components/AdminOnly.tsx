'use client';

import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AdminOnlyProps {
  children: React.ReactNode;
}

export default function AdminOnly({ children }: AdminOnlyProps) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!isAuthenticated) {
        console.log(' Not authenticated');
        router.push('/auth/login');
        return;
      }

      console.log(' Current user in store:', user);
      
      if (!user) {
        console.log(' No user data in store');
        router.push('/auth/login');
        return;
      }

      if (user.role !== 'ADMIN') {
        console.log(` Not an admin, role: ${user.role}`);
        router.push('/');
        return;
      }

      console.log(` Admin access granted for: ${user.email}`);
      setChecking(false);
    };

    checkAccess();
  }, [user, isAuthenticated, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-2 border-blue-500/30 flex items-center justify-center animate-pulse">
            <span className="text-2xl">⏳</span>
          </div>
          <p className="text-foreground/60">Проверка доступа...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}