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
      <div className="absolute inset-0 bg-hero-pattern" />
      <div className="absolute inset-0 dot-pattern opacity-40" />

      {/* Animated orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/5 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
          <Gamepad2 className="h-4 w-4" />
          <span>SIET Esports Club — Championship 2026</span>
        </div>

        {/* Main heading */}
        <h1 className="font-display font-bold leading-none mb-4">
          <span className="block text-5xl sm:text-7xl lg:text-8xl text-white tracking-tight">
            {content.hero_title || 'SIET ESPORTS'}
          </span>
          <span className="block text-4xl sm:text-5xl lg:text-6xl text-gradient mt-2">
            {content.hero_subtitle || 'Championship 2026'}
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-indigo-300/80 font-mono text-sm sm:text-base tracking-widest uppercase mb-6">
          {content.hero_tagline || 'Play Smart · Stay Calm · Become a Champion'}
        </p>

        {/* Description */}
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          {content.hero_description || 'The official inter-department esports championship of SIET, organised by the SIET Esports Club. BGMI and Free Fire MAX squad battles, held on campus.'}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            to="/register"
            className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-900/30 hover:shadow-indigo-600/30 hover:-translate-y-0.5 text-base"
          >
            <Gamepad2 className="h-5 w-5" />
            Register Your Squad
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button
            onClick={() => scrollTo('championship')}
            className="flex items-center gap-2 border border-white/10 hover:border-indigo-500/40 text-white hover:text-indigo-300 font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:bg-indigo-600/5 text-base"
          >
            View Championship
          </button>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-3 justify-center">
          {[
            { icon: Shield, text: 'BGMI — Squad of 4' },
            { icon: Zap, text: 'Free Fire MAX — Squad of 4' },
            { icon: Gamepad2, text: 'Cash Prize Pool' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 px-4 py-2 bg-white/4 border border-white/8 rounded-full text-sm text-slate-300">
              <Icon className="h-3.5 w-3.5 text-indigo-400" />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => scrollTo('championship')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors animate-bounce"
      >
        <span className="text-xs font-mono uppercase tracking-wider">Scroll</span>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </section>
  );
}
