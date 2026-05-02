import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Mic, History, Settings, LogOut } from 'lucide-react';
import { cn } from './ui/Button'; // using cn from Button or create a separate utils

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Record', path: '/record', icon: Mic },
  { name: 'History', path: '/history', icon: History },
  { name: 'Settings', path: '/change-password', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-64 h-screen glass-card rounded-none border-y-0 border-l-0 border-r border-white/10 flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00E0FF] to-[#7B61FF] flex items-center justify-center shadow-[0_0_15px_rgba(0,224,255,0.5)]">
          <Mic size={18} className="text-white" />
        </div>
        <h1 className="text-2xl font-outfit font-bold tracking-tight text-white">
          Meetly<span className="text-[#00E0FF]">.</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-8">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium',
                isActive
                  ? 'bg-gradient-to-r from-[#00E0FF]/20 to-[#7B61FF]/20 text-white shadow-[inset_0_0_10px_rgba(0,224,255,0.2)] border border-white/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )
            }
          >
            <item.icon size={20} className="shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4">
        <NavLink
          to="/signin"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300 w-full"
        >
          <LogOut size={20} className="shrink-0" />
          Sign Out
        </NavLink>
      </div>
    </aside>
  );
}
