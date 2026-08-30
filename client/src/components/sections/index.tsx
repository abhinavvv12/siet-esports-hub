import { useState } from 'react';
import { Phone, Mail, ChevronDown, ChevronUp, X } from 'lucide-react';
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
      desc: 'Matches progress through League Stage → Group Stage → Knockout Stage → Quarter Finals → Semi Finals → Grand Finals.',
    },
    {
      num: '03',
      title: 'Match Schedule',
      desc: 'The official match fixtures, brackets, groups and schedule will be announced after registrations close and team registrations are finalized.',
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
            <div key={s.num} className={`card-hover p-6 relative ${i === 1 ? 'md:border-indigo-500/20' : ''}`}>
              <div className="text-5xl font-display font-black text-indigo-600/20 mb-3">{s.num}</div>
              <h3 className="text-lg font-display font-bold text-white mb-3">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Stage pipeline visual */}
        <div className="mt-12 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max mx-auto justify-center py-4">
            {['Registration', 'League Stage', 'Knockout Stage', 'Quarter Finals', 'Semi Finals', 'Grand Finals'].map((stage, i, arr) => (
              <div key={stage} className="flex items-center gap-2">
                <div className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  i === arr.length - 1
                    ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-800/50 border-slate-700/30 text-slate-400'
                }`}>
                  {stage}
                </div>
                {i < arr.length - 1 && <span className="text-indigo-600/40">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Faculty Section ──────────────────────────────────────────────
export function FacultySection({ coordinators, isLoading }: { coordinators: FacultyCoordinator[]; isLoading: boolean }) {
  return (
    <section id="faculty" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-indigo-400 font-mono text-xs uppercase tracking-widest mb-3">Academic Leadership</p>
          <h2 className="text-4xl font-display font-bold text-white">Faculty <span className="text-gradient">Coordinators</span></h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="card p-6 skeleton h-40" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coordinators.map((f) => (
              <div key={f.id} className="card-hover p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-display font-bold text-indigo-400">
                    {f.name.split(' ').pop()?.charAt(0)}
                  </span>
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-1">{f.name}</h3>
                <p className="text-indigo-400 text-sm font-medium mb-1">{f.designation}</p>
                <p className="text-slate-500 text-sm">{f.department}</p>
                {f.email && (
                  <a href={`mailto:${f.email}`} className="flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-indigo-300 mt-3 transition-colors">
                    <Mail className="h-3 w-3" />{f.email}
                  </a>
                )}
              </div>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-indigo-400 font-mono text-xs uppercase tracking-widest mb-3">Club Management</p>
          <h2 className="text-4xl font-display font-bold text-white">Student <span className="text-gradient">Coordinators</span></h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => <div key={i} className="card p-5 skeleton h-36" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {coordinators.map((s) => (
              <div key={s.id} className="card-hover p-5 text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-display font-bold text-purple-400">{s.name.charAt(0)}</span>
                </div>
                <h3 className="text-base font-display font-semibold text-white mb-0.5">{s.name}</h3>
                <p className="text-indigo-400 text-xs font-medium mb-0.5">{s.department}</p>
                <p className="text-slate-500 text-xs mb-3">{s.year}</p>
                {s.phone && (
                  <a href={`tel:${s.phone.replace(/\s/g, '')}`}
                    className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-green-400 transition-colors">
                    <Phone className="h-3 w-3" />
                    {s.phone}
                  </a>
                )}
              </div>
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
                  <p className="text-slate-200 text-sm flex-1 leading-relaxed">{rule.content}</p>
                  <div className="text-slate-500 flex-shrink-0">
                    {expanded === rule.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
                {expanded === rule.id && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="pl-12 text-xs text-slate-500 leading-relaxed border-l-2 border-indigo-500/20 ml-4">
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

      {/* Lightbox */}
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
            <p className="text-slate-400 leading-relaxed mb-6">
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
