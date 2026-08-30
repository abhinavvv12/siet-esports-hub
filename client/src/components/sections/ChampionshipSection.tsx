import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Trophy, ChevronRight, Lock } from 'lucide-react';
import { Tournament } from '../../types';
import { EventStatusBadge } from '../ui';

interface Props {
  tournaments: Tournament[];
  isLoading: boolean;
}

const GameIcon = ({ game }: { game: string }) => {
  if (game === 'BGMI') {
    return (
      <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
        <span className="text-xl">🎯</span>
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
      <span className="text-xl">🔥</span>
    </div>
  );
};

export default function ChampionshipSection({ tournaments, isLoading }: Props) {
  return (
    <section id="championship" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-indigo-400 font-mono text-xs uppercase tracking-widest mb-3">Active Tournaments</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            The <span className="text-gradient">Championship</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Choose your battleground. Register your squad and compete for glory in SIET's premier esports championship.
          </p>
        </div>

        {/* Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="card p-6 space-y-4">
                <div className="skeleton h-12 w-12 rounded-xl" />
                <div className="skeleton h-6 w-2/3" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No tournaments available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {tournaments.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TournamentCard({ tournament: t }: { tournament: Tournament }) {
  const isOpen = t.registrationOpen && t.status === 'REGISTRATION_OPEN';
  const registered = t._count?.registrations ?? 0;
  const maxTeams = t.maxTeams ?? 32;
  const fillPercent = Math.min(100, (registered / maxTeams) * 100);

  return (
    <div className="card-hover p-6 relative overflow-hidden group">
      {/* Top glow on hover */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <GameIcon game={t.game} />
          <div>
            <h3 className="text-xl font-display font-bold text-white">{t.name}</h3>
            <p className="text-indigo-400 text-sm font-mono">{t.game}</p>
          </div>
        </div>
        <EventStatusBadge status={t.status} />
      </div>

      <p className="text-slate-400 text-sm mb-5 leading-relaxed">{t.description}</p>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Detail icon={Users} label="Mode" value={`Squad (${t.teamSize} players)`} />
        <Detail icon={MapPin} label="Venue" value={t.venue || 'SIET Campus'} />
        <Detail icon={Calendar} label="Date" value={
          t.startDate ? new Date(t.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Coming Soon'
        } />
        <Detail icon={Trophy} label="Entry" value={t.entryFee || 'Cash Payment Only'} />
      </div>

      {/* Slot progress */}
      {t.maxTeams && (
        <div className="mb-5">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Slots filled</span>
            <span>{registered}/{maxTeams} teams</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full transition-all"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* CTA */}
      {isOpen ? (
        <Link
          to={`/register?tournament=${t.id}`}
          className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 group/btn"
        >
          Register Squad
          <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      ) : (
        <div className="flex items-center justify-center gap-2 w-full bg-slate-800 text-slate-500 font-semibold py-3 rounded-xl cursor-not-allowed">
          <Lock className="h-4 w-4" />
          {t.status === 'REGISTRATION_CLOSED' ? 'Registrations Closed' :
           t.status === 'COMPLETED' ? 'Tournament Completed' :
           t.status === 'CANCELLED' ? 'Cancelled' : 'Registrations Not Open'}
        </div>
      )}
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg">
      <Icon className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm text-slate-200 font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
