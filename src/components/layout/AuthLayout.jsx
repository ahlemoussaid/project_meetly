import { Outlet } from 'react-router-dom';
import { Mic } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center relative overflow-hidden p-4">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[#00E0FF]/20 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#7B61FF]/20 blur-[100px] pointer-events-none"></div>
      
      {/* Decorative grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00E0FF] to-[#7B61FF] flex items-center justify-center shadow-[0_0_30px_rgba(0,224,255,0.5)] mb-4">
            <Mic size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-outfit font-bold tracking-tight text-white mb-2">
            Meetly<span className="text-[#00E0FF]">.</span>
          </h1>
          <p className="text-white/60 text-center font-medium">
            AI-Powered Meeting Summaries
          </p>
        </div>
        
        <Outlet />
      </div>
    </div>
  );
}
