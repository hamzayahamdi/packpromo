import Image from 'next/image';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-[20%] left-[15%] w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[20%] right-[15%] w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/10">
        <div className="flex justify-center mb-8">
          <div className="relative w-[220px] h-[90px]">
            <Image
              src="/topdeal.svg"
              alt="TopDeal Logo"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        </div>

        {/* Informative text */}
        <div className="mb-8 text-center">
          <h1 className="text-white/90 text-xl font-semibold mb-2">Admin Dashboard</h1>
          <p className="text-white/70 text-sm">
            Welcome to TopDeal admin panel. Enter your password to manage products and categories.
          </p>
        </div>

        <LoginForm />

        {/* Footer text */}
        <p className="mt-6 text-center text-white/50 text-xs">
          Protected area. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
} 