import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, ScanLine, Map, Briefcase, Building2, Zap } from 'lucide-react';

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/audit', icon: ScanLine, label: 'Skill Audit' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/opportunities', icon: Briefcase, label: 'Opportunities' },
  { to: '/enterprise', icon: Building2, label: 'Enterprise' },
];

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <aside className="w-64 flex flex-col py-6 px-4 border-r" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 px-2 mb-10">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--amber)' }}>
            <Zap size={16} className="text-black" />
          </div>
          <span className="font-bold text-lg" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>
            Skiller<span className="gradient-text">AI</span>
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'text-black' : 'hover:bg-white/5'}`
              }
              style={({ isActive }) => isActive ? { background: 'var(--amber)', color: '#000' } : { color: 'var(--muted)' }}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t pt-4 mt-4" style={{ borderColor: 'var(--border)' }}>
          <div className="px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--card2)', color: 'var(--muted)' }}>
            ⚡ Skiller AI MVP v1.0
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}