import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const quickLinks = [
  { href: '/#championship', label: 'Championship' },
  { href: '/#formats', label: 'Formats' },
  { href: '/#rules', label: 'Rules' },
  { href: '/#gallery', label: 'Gallery' },
  { href: '/#winners', label: 'Winners' },
  { href: '/#about', label: 'About SIET' },
  { href: '/register', label: 'Registration' },
  { href: '/certificates', label: 'Certificates' },
  { href: '/#contact', label: 'Contact' },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/5">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img
                src="/logos/esports-logo.png"
                alt="SIET Esports Club"
                className="h-10 w-auto object-contain"
                style={{ filter: 'drop-shadow(0 0 6px rgba(140,60,255,0.35))' }}
              />
              <span className="font-display font-bold text-white text-lg">
                SIET <span className="text-purple-400">Esports</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-4 max-w-sm">
              The official esports club of Siddhartha Institute of Engineering & Technology.
              <span className="text-indigo-400 font-medium"> Game on. Legends rise.</span>
            </p>
            <div className="space-y-2">
              <a href="mailto:esports@siddhartha.co.in" className="flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-300 transition-colors">
                <Mail className="h-4 w-4 text-indigo-500" />
                esports@siddhartha.co.in
              </a>
              <a href="tel:+919000000001" className="flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-300 transition-colors">
                <Phone className="h-4 w-4 text-indigo-500" />
                +91 90000 00001
              </a>
              <div className="flex items-start gap-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <span>Siddhartha Institute of Engineering & Technology,<br />Ibrahimpatnam, Hyderabad, Telangana</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.slice(0, 5).map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-slate-400 hover:text-indigo-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">More</h3>
            <ul className="space-y-2">
              {quickLinks.slice(5).map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-slate-400 hover:text-indigo-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/coordinator/login" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors mt-3 pt-3 border-t border-white/5">
                  <ExternalLink className="h-3.5 w-3.5" /> Coordinator Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} SIET Esports Club. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Siddhartha Institute of Engineering & Technology — Ibrahimpatnam, Hyderabad
          </p>
        </div>
      </div>
    </footer>
  );
}
