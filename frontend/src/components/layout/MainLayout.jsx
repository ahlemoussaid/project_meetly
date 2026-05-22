import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] flex">
      {/* Background glowing orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#7B61FF]/20 blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#00E0FF]/20 blur-[120px] pointer-events-none"></div>
      
      <Sidebar />
      <main className="flex-1 ml-64 p-8 relative z-10 min-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
