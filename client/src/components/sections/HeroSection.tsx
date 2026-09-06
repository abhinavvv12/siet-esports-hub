import { Link } from 'react-router-dom';
import { ChevronRight, Gamepad2, Shield, Zap } from 'lucide-react';

interface HeroContent {
  hero_title?: string;
  hero_subtitle?: string;
  hero_tagline?: string;
  hero_description?: string;
}

export default function HeroSection({ content }: { content: HeroContent }) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background layers */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #120820 40%, #0d0520 60%, #0a0a1a 100%)' }} />
      <div className="absolute inset-0 dot-pattern opacity-30" />

      {/* Purple atmospheric glows — mimicking stadium lighting */}
      <div className="absolute top-0 left-0 w-1/2 h-2/3 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 20% 30%, rgba(120,40,220,0.18) 0%, transparent 60%)' }} />
      <div className="absolute top-0 right-0 w-1/2 h-2/3 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 80% 30%, rgba(120,40,220,0.18) 0%, transparent 60%)' }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(90,20,180,0.12) 0%, transparent 70%)' }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-10">

        {/* ── COLLEGE LOGO ── */}
        <div className="flex justify-center mb-3">
          <img
            src="/logos/college-logo.png"
            alt="Siddhartha Group of Institutions"
            className="w-24 h-auto sm:w-28 md:w-32 object-contain drop-shadow-lg"
            style={{ filter: 'drop-shadow(0 0 12px rgba(200,160,0,0.3))' }}
          />
        </div>

        {/* ── ESPORTS CLUB LOGO ── */}
        <div className="flex justify-center mb-4">
          <img
            src="/logos/esports-logo.png"
            alt="SIET Esports Club"
            className="w-36 h-auto sm:w-44 md:w-52 object-contain drop-shadow-xl"
            style={{ filter: 'drop-shadow(0 0 20px rgba(140,60,255,0.45))' }}
          />
        </div>

        {/* ── MAIN HEADING ── */}
        <h1 className="font-display font-bold leading-tight mb-3 px-2">
          {/* Full college name — responsive sizing, wraps naturally on mobile */}
          <span
            className="block text-white tracking-tight"
            style={{ fontSize: 'clamp(1.4rem, 4vw, 3rem)', lineHeight: 1.15, textTransform: 'uppercase', letterSpacing: '0.02em' }}
          >
            Siddhartha Institute of<br className="hidden sm:block" />{' '}
            Engineering &amp; Technology
          </span>
          <span
            className="block font-black tracking-wide mt-1"
            style={{
              fontSize: 'clamp(1.6rem, 5vw, 3.5rem)',
              background: 'linear-gradient(90deg, #a78bfa, #7c3aed, #c4b5fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textTransform: 'uppercase',
            }}
          >
            Esports
          </span>
          {/* Championship line */}
          <span
            className="block mt-2"
            style={{
              fontSize: 'clamp(1.1rem, 3vw, 2rem)',
              background: 'linear-gradient(90deg, #818cf8, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            {content.hero_subtitle || 'Championship 2026'}
          </span>
        </h1>

        {/* ── TAGLINE ── */}
        <p className="text-purple-300/90 font-mono text-xs sm:text-sm tracking-widest uppercase mb-5">
          {content.hero_tagline || 'Play Smart · Stay Calm · Become a Champion'}
        </p>

        {/* ── DESCRIPTION — white for readability ── */}
        <p className="text-white/90 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8 px-2">
          {content.hero_description ||
            'The official inter-department esports championship of SIET, organised by the SIET Esports Club. BGMI and Free Fire MAX squad battles, held on campus.'}
        </p>

        {/* ── CTA BUTTONS ── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-10">
          <Link
            to="/register"
            className="group flex items-center gap-2 text-white font-bold px-7 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 text-sm sm:text-base w-full sm:w-auto justify-center"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
            }}
          >
            <Gamepad2 className="h-4 w-4" />
            Register Your Squad
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button
            onClick={() => scrollTo('championship')}
            className="flex items-center gap-2 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 text-sm sm:text-base w-full sm:w-auto justify-center"
            style={{
              border: '1px solid rgba(167,139,250,0.35)',
              background: 'rgba(124,58,237,0.08)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.18)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.08)')}
          >
            View Championship
          </button>
        </div>

        {/* ── FEATURE PILLS — NO scroll indicator ── */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { icon: Shield, text: 'BGMI — Squad of 4' },
            { icon: Zap, text: 'Free Fire MAX — Squad of 4' },
            { icon: Gamepad2, text: 'Cash Prize Pool' },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm text-slate-200"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(167,139,250,0.2)',
              }}
            >
              <Icon className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
              {text}
            </div>
          ))}
        </div>
        {/* ── SCROLL INDICATOR REMOVED (as requested) ── */}
      </div>
    </section>
  );
}
