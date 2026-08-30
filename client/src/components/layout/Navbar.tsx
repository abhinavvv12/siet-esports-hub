import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Gamepad2, ChevronRight } from 'lucide-react';

const navLinks = [
  { href: '/#championship', label: 'Championship' },
  { href: '/#formats', label: 'Formats' },
  { href: '/#faculty', label: 'Faculty' },
  { href: '/#students', label: 'Students' },
  { href: '/#rules', label: 'Rules' },
  { href: '/#gallery', label: 'Gallery' },
  { href: '/register', label: 'Register' },
  { href: '/certificates', label: 'Certificates' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => setIsOpen(false), [location]);

  const handleNavClick = (href: string) => {
    if (href.includes('#')) {
      const id = href.split('#')[1];
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (href.startsWith('/#')) {
        // Navigate home first then scroll
        window.location.href = href;
      }
    }
    setIsOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled ? 'bg-slate-950/95 backdrop-blur-md shadow-lg shadow-black/20 border-b border-white/5' : 'bg-transparent'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-1.5 bg-indigo-600 rounded-lg group-hover:bg-indigo-500 transition-colors">
              <Gamepad2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">
              SIET <span className="text-indigo-400">Esports</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              link.href.includes('#') ? (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-150"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                    location.pathname === link.href
                      ? 'text-indigo-300 bg-indigo-600/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-2">
            <Link to="/coordinator/login" className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5">
              Coordinator Login
            </Link>
            <Link to="/register" className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:-translate-y-0.5">
              Register Squad <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden py-3 border-t border-white/5">
            <div className="space-y-1 pb-3">
              {navLinks.map((link) => (
                link.href.includes('#') ? (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className="block w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </div>
            <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
              <Link to="/coordinator/login" className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-300 transition-colors">
                Coordinator Login
              </Link>
              <Link to="/register" className="mx-4 py-2.5 text-center bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors">
                Register Your Squad
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
