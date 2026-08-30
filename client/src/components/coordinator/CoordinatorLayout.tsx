import { useState, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Gamepad2, LayoutDashboard, Users, Trophy, FileText,
  Image, Award, Megaphone, Settings, LogOut, ChevronDown,
  ChevronRight, Menu, X, Bell, CreditCard, Shield, BarChart3,
  UserCheck, BookOpen, ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavGroup {
  label: string;
  items: { href: string; icon: React.ElementType; label: string; adminOnly?: boolean }[];
}

const navGroups: NavGroup[] = [
  {
    label: '',
    items: [
      { href: '/coordinator/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Event Management',
    items: [
      { href: '/coordinator/tournaments', icon: Trophy, label: 'Tournaments' },
      { href: '/coordinator/matches', icon: ClipboardList, label: 'Matches' },
    ],
  },
  {
    label: 'Participants',
    items: [
      { href: '/coordinator/registrations', icon: FileText, label: 'Registrations' },
      { href: '/coordinator/teams', icon: Users, label: 'Teams' },
      { href: '/coordinator/payments', icon: CreditCard, label: 'Payments' },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/coordinator/announcements', icon: Megaphone, label: 'Announcements' },
      { href: '/coordinator/gallery', icon: Image, label: 'Gallery' },
      { href: '/coordinator/winners', icon: Award, label: 'Winners' },
      { href: '/coordinator/faculty', icon: UserCheck, label: 'Faculty' },
      { href: '/coordinator/students', icon: Users, label: 'Students' },
      { href: '/coordinator/rules', icon: BookOpen, label: 'Rules' },
      { href: '/coordinator/content', icon: Settings, label: 'Homepage CMS' },
    ],
  },
  {
    label: 'Certificates',
    items: [
      { href: '/coordinator/certificates', icon: Shield, label: 'Certificates' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { href: '/coordinator/reports', icon: BarChart3, label: 'Statistics' },
      { href: '/coordinator/audit', icon: ClipboardList, label: 'Audit Log' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { href: '/coordinator/users', icon: UserCheck, label: 'Users', adminOnly: true },
    ],
  },
];

interface Props {
  children: ReactNode;
  title?: string;
}

export default function CoordinatorLayout({ children, title }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/coordinator/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-slate-800 flex-shrink-0">
        <Link to="/coordinator/dashboard" className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-600 rounded-lg">
            <Gamepad2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-white font-display font-bold text-sm leading-tight">SIET Esports</p>
            <p className="text-indigo-400 text-xs">Coordinator Hub</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(item => !item.adminOnly || isAdmin);
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.label}>
              {group.label && (
                <p className="px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {visibleItems.map(item => {
                  const active = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`coord-nav-item ${active ? 'active' : ''}`}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-indigo-300">{user?.name?.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role?.toLowerCase()}</p>
          </div>
          <button onClick={handleLogout} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors" title="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <Link to="/" target="_blank" className="flex items-center gap-2 mt-2 px-3 py-2 text-xs text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition-colors">
          <ChevronRight className="h-3 w-3" /> View Public Website
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-56 xl:w-60 flex-col bg-slate-900 border-r border-slate-800 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-60 bg-slate-900 border-r border-slate-800 flex flex-col z-10">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-slate-900/80 border-b border-slate-800 flex-shrink-0 backdrop-blur-sm">
          <div className="flex items-center h-14 px-4 gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg">
              <Menu className="h-5 w-5" />
            </button>
            {title && (
              <h1 className="text-base font-semibold text-white hidden sm:block">{title}</h1>
            )}
            <div className="flex-1" />
            <button className="p-2 text-slate-400 hover:text-white rounded-lg relative">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-300">{user?.name?.charAt(0)}</span>
              </div>
              <span className="text-sm text-slate-300 hidden sm:block">{user?.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
