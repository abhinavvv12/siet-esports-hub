import { useState } from 'react';
import { Phone, Mail, ChevronDown, ChevronUp, X, User } from 'lucide-react';
import { FacultyCoordinator, StudentCoordinator, Rule, GalleryImage, Announcement } from '../../types';

// ─── Road to Finals (Formats) ─────────────────────────────────────
export function FormatsSection() {
  const stages = [
    {
      num: '01',
      title: 'Registration & Slot Confirmation',
      desc: 'Teams register through the website. Registrations are confirmed only after cash payment verification by the SIET Esports Club Coordinator.',
    },
    {
      num: '02',
      title: 'Tournament Structure',
      desc: 'Match format and stages will be determined based on the number of squad registrations.',
      emphasis: true,
    },
    {
      num: '03',
      title: 'Match Schedule',
      desc: 'The match format, fixtures, brackets and schedule will be finalized after registrations close, based on the number of registered squads.',
    },
  ];

  return (
    <section id="formats" className="py-20 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-indigo-400 font-mono text-xs uppercase tracking-widest mb-3">Tournament Structure</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
            Road To The <span className="text-gradient">Finals</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stages.map((s, i) => (
            <div key={s.num} className={`card-hover p-6 relative ${i === 1 ? 'md:border-purple-500/30' : ''}`}>
              {/* Section number — WHITE and clearly visible */}
              <div
                className="font-display font-black mb-3 leading-none"
                style={{ fontSize: '3.5rem', color: 'rgba(255,255,255,0.85)' }}
              >
                {s.num}
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-3">{s.title}</h3>
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: s.emphasis ? '#e2e8f0' : '#94a3b8',
                  fontWeight: s.emphasis ? 600 : 400,
                }}
              >
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Stage pipeline — simplified, no fixed stages */}
        <div className="mt-10 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2">
            {['Registration', 'Slot Confirmation', 'Format Decided', 'Fixtures Announced', 'Matches Begin'].map((stage, i, arr) => (
              <div key={stage} className="flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  i === arr.length - 1
                    ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                    : 'bg-slate-800/50 border-slate-700/30 text-slate-400'
                }`}>
                  {stage}
                </div>
                {i < arr.length - 1 && <span className="text-purple-600/40 text-xs">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Glassmorphism Card (shared) ──────────────────────────────────
function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden text-center ${className}`}
      style={{
        background: 'rgba(30, 10, 60, 0.55)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(167,139,250,0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* Subtle top glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.4), transparent)' }}
      />
      {children}
    </div>
  );
}

// ─── Avatar placeholder ───────────────────────────────────────────
function AvatarPlaceholder({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  const dims = size === 'lg' ? 'w-24 h-24' : size === 'md' ? 'w-20 h-20' : 'w-16 h-16';
  const fontSize = size === 'lg' ? '2rem' : size === 'md' ? '1.6rem' : '1.2rem';
  return (
    <div
      className={`${dims} rounded-full flex items-center justify-center mx-auto flex-shrink-0`}
      style={{
        background: 'linear-gradient(135deg, rgba(109,40,217,0.6), rgba(91,33,182,0.4))',
        border: '2px solid rgba(167,139,250,0.3)',
        boxShadow: '0 0 16px rgba(124,58,237,0.25)',
        fontSize,
        fontWeight: 700,
        color: '#c4b5fd',
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {initial}
    </div>
  );
}

// ─── Faculty Section ──────────────────────────────────────────────
export function FacultySection({ coordinators, isLoading }: { coordinators: FacultyCoordinator[]; isLoading: boolean }) {
  return (
    <section id="faculty" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-purple-400 font-mono text-xs uppercase tracking-widest mb-3">Academic Leadership</p>
          <h2 className="text-4xl font-display font-bold text-white">
            Faculty <span className="text-gradient">Coordinators</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="skeleton rounded-2xl h-56" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coordinators.map((f) => (
              <GlassCard key={f.id} className="p-7">
                {/* Photo or avatar */}
                <div className="mb-4">
                  {f.photo ? (
                    <img
                      src={f.photo}
                      alt={f.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto"
                      style={{
                        border: '2px solid rgba(167,139,250,0.35)',
                        boxShadow: '0 0 20px rgba(124,58,237,0.3)',
                      }}
                    />
                  ) : (
                    <AvatarPlaceholder name={f.name} size="lg" />
                  )}
                </div>

                {/* Name */}
                <h3 className="text-white font-display font-bold text-lg leading-tight mb-1">
                  {f.name}
                </h3>

                {/* Department */}
                <p className="text-slate-300 text-sm mb-1">{f.department}</p>

                {/* Designation */}
                <p
                  className="text-xs font-medium uppercase tracking-wider mb-3"
                  style={{ color: '#a78bfa' }}
                >
                  {f.designation}
                </p>

                {/* Email */}
                {f.email && (
                  <a
                    href={`mailto:${f.email}`}
                    className="inline-flex items-center gap-1.5 text-xs transition-colors"
                    style={{ color: '#94a3b8' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                  >
                    <Mail className="h-3 w-3" />
                    {f.email}
                  </a>
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Student Section ──────────────────────────────────────────────
export function StudentsSection({ coordinators, isLoading }: { coordinators: StudentCoordinator[]; isLoading: boolean }) {
  return (
    <section id="students" className="py-20 bg-slate-900/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-purple-400 font-mono text-xs uppercase tracking-widest mb-3">Club Management</p>
          <h2 className="text-4xl font-display font-bold text-white">
            Student <span className="text-gradient">Coordinators</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton rounded-2xl h-48" />)}
          </div>
        ) : (
          /* Desktop: 2-column grid; stacks on mobile */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {coordinators.map((s) => (
              <GlassCard key={s.id} className="p-6">
                <div className="flex items-center gap-4 text-left">
                  {/* Photo or avatar */}
                  <div className="flex-shrink-0">
                    {s.photo ? (
                      <img
                        src={s.photo}
                        alt={s.name}
                        className="w-16 h-16 rounded-full object-cover"
                        style={{
                          border: '2px solid rgba(167,139,250,0.3)',
                          boxShadow: '0 0 14px rgba(124,58,237,0.25)',
                        }}
                      />
                    ) : (
                      <AvatarPlaceholder name={s.name} size="sm" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-display font-bold text-base leading-tight truncate">
                      {s.name}
                    </h3>
                    <p className="text-slate-300 text-sm mt-0.5">{s.year}</p>
                    <p className="text-sm mt-0.5" style={{ color: '#a78bfa' }}>
                      {s.department}
                      {s.role ? ` · ${s.role}` : ''}
                    </p>
                    {s.phone && (
                      <a
                        href={`tel:${s.phone.replace(/\s/g, '')}`}
                        className="inline-flex items-center gap-1.5 mt-2 text-xs font-mono transition-colors"
                        style={{ color: '#94a3b8' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#4ade80')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                      >
                        <Phone className="h-3 w-3" />
                        {s.phone}
                      </a>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Rules Section ────────────────────────────────────────────────
export function RulesSection({ rules, isLoading }: { rules: Rule[]; isLoading: boolean }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section id="rules" className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-indigo-400 font-mono text-xs uppercase tracking-widest mb-3">Participation Guidelines</p>
          <h2 className="text-4xl font-display font-bold text-white">Tournament <span className="text-gradient">Rules</span></h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="card-hover overflow-hidden cursor-pointer"
                onClick={() => setExpanded(expanded === rule.id ? null : rule.id)}
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      {String(rule.ruleNumber).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-white text-sm flex-1 leading-relaxed">{rule.content}</p>
                  <div className="text-slate-500 flex-shrink-0">
                    {expanded === rule.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
                {expanded === rule.id && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="pl-12 text-xs text-slate-400 leading-relaxed border-l-2 border-indigo-500/20 ml-4">
                      Violation of this rule may result in immediate disqualification from the championship.
                      All decisions by the Faculty Coordinators are final and binding.
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {rules.length === 0 && !isLoading && (
          <p className="text-center text-slate-500">Rules will be published soon.</p>
        )}
      </div>
    </section>
  );
}

// ─── Gallery Section ──────────────────────────────────────────────
export function GallerySection({ images, isLoading }: { images: GalleryImage[]; isLoading: boolean }) {
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);

  return (
    <section id="gallery" className="py-20 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-indigo-400 font-mono text-xs uppercase tracking-widest mb-3">Moments & Highlights</p>
          <h2 className="text-4xl font-display font-bold text-white">Event <span className="text-gradient">Gallery</span></h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="skeleton aspect-square rounded-xl" />)}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">Gallery Coming Soon</h3>
            <p className="text-slate-500 text-sm">Event photos will be published after the championship.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer bg-slate-800"
                onClick={() => setLightbox(img)}
              >
                <img
                  src={img.url}
                  alt={img.title || 'Gallery image'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/40 transition-colors duration-300 flex items-end">
                  {img.title && (
                    <div className="p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 w-full">
                      <p className="text-white text-sm font-medium truncate">{img.title}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg" onClick={() => setLightbox(null)}>
            <X className="h-6 w-6" />
          </button>
          <div className="max-w-4xl max-h-[90vh] overflow-hidden rounded-xl" onClick={e => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.title || ''} className="max-h-[85vh] w-auto object-contain" />
            {(lightbox.title || lightbox.description) && (
              <div className="bg-slate-900 p-4">
                {lightbox.title && <p className="text-white font-semibold">{lightbox.title}</p>}
                {lightbox.description && <p className="text-slate-400 text-sm mt-1">{lightbox.description}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Winners Section ──────────────────────────────────────────────
export function WinnersSection() {
  return (
    <section id="winners" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-indigo-400 font-mono text-xs uppercase tracking-widest mb-3">Hall of Fame</p>
          <h2 className="text-4xl font-display font-bold text-white">Tournament <span className="text-gradient">Winners</span></h2>
        </div>
        <div className="text-center py-16 card max-w-xl mx-auto">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-slate-300 mb-2">Tournament in Progress</h3>
          <p className="text-slate-500 text-sm">Winner photos and achievements will be published after the tournament concludes. Stay tuned!</p>
        </div>
      </div>
    </section>
  );
}

// ─── About Section ────────────────────────────────────────────────
export function AboutSection({ content }: { content: Record<string, string> }) {
  return (
    <section id="about" className="py-20 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-indigo-400 font-mono text-xs uppercase tracking-widest mb-3">Our Institution</p>
            <h2 className="text-4xl font-display font-bold text-white mb-5">
              {content.about_heading || 'About SIET'}
            </h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              {content.about_description || 'Siddhartha Institute of Engineering & Technology, part of the Siddhartha Group of Institutions established in 1994.'}
            </p>
          </div>
          <div className="space-y-5">
            <div className="card p-5 border-l-2 border-indigo-500">
              <h3 className="text-indigo-400 font-semibold uppercase text-xs tracking-wider mb-2">Mission</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{content.mission || ''}</p>
            </div>
            <div className="card p-5 border-l-2 border-purple-500">
              <h3 className="text-purple-400 font-semibold uppercase text-xs tracking-wider mb-2">Vision</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{content.vision || ''}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Announcements ────────────────────────────────────────────────
export function AnnouncementsBar({ announcements }: { announcements: Announcement[] }) {
  if (!announcements.length) return null;
  const latest = announcements[0];
  return (
    <div className="bg-indigo-600/10 border-y border-indigo-500/20 py-2.5">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
        <span className="text-indigo-400 text-xs font-mono uppercase tracking-wider flex-shrink-0">📣 Latest</span>
        <span className="text-slate-300 text-sm truncate">{latest.title}: {latest.description}</span>
      </div>
    </div>
  );
}

// ─── Contact Section ──────────────────────────────────────────────
export function ContactSection({ content }: { content: Record<string, string> }) {
  return (
    <section id="contact" className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-indigo-400 font-mono text-xs uppercase tracking-widest mb-3">Get In Touch</p>
        <h2 className="text-4xl font-display font-bold text-white mb-10">Contact <span className="text-gradient">Us</span></h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <a href={`mailto:${content.contact_email || 'esports@siddhartha.co.in'}`}
            className="card-hover p-6 text-center">
            <Mail className="h-8 w-8 text-indigo-400 mx-auto mb-3" />
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Email</p>
            <p className="text-indigo-300 text-sm font-medium break-all">{content.contact_email || 'esports@siddhartha.co.in'}</p>
          </a>
          <a href={`tel:${(content.contact_phone || '+919000000001').replace(/\s/g, '')}`}
            className="card-hover p-6 text-center">
            <Phone className="h-8 w-8 text-indigo-400 mx-auto mb-3" />
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Phone</p>
            <p className="text-indigo-300 text-sm font-medium">{content.contact_phone || '+91 90000 00001'}</p>
          </a>
          <div className="card p-6 text-center">
            <div className="h-8 w-8 mx-auto mb-3 flex items-center justify-center">
              <span className="text-2xl">📍</span>
            </div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Campus</p>
            <p className="text-slate-300 text-sm">{content.contact_address || 'Ibrahimpatnam, Hyderabad, Telangana'}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
