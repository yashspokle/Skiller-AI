import { useEffect, useState } from 'react';
import { ExternalLink, Filter } from 'lucide-react';
import { oppsAPI } from '../services/api';

const TYPE_COLORS = {
  'full-time': '#4FC3F7',
  'internship': '#B39DDB',
  'gig': '#00FF94'
};

export default function OpportunitiesPage() {
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    oppsAPI.getAll().then(setOpps).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? opps : opps.filter(o => o.type === filter);

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>Opportunity Match</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Roles matched to your current skill profile</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} style={{ color: 'var(--muted)' }} />
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--card)' }}>
            {['all', 'full-time', 'internship', 'gig'].map(t => (
              <button key={t} onClick={() => setFilter(t)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
                style={filter === t ? { background: 'var(--amber)', color: '#000' } : { color: 'var(--muted)' }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--muted)' }}>Loading opportunities…</div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(opp => (
            <div key={opp.id} className="rounded-2xl p-5 hover-lift" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: 'var(--card2)', border: '1px solid var(--border)' }}>
                    {opp.company[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold">{opp.title}</h3>
                    <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>{opp.company} · {opp.salary}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {opp.requiredSkills.map(s => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--card2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full" style={{
                        width: `${opp.match}%`,
                        background: opp.match >= 70 ? '#00FF94' : opp.match >= 40 ? '#F5A623' : '#ff6666'
                      }} />
                    </div>
                    <span className="text-sm font-bold" style={{ color: opp.match >= 70 ? '#00FF94' : opp.match >= 40 ? '#F5A623' : '#ff6666' }}>
                      {opp.match}%
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                    style={{ background: `${TYPE_COLORS[opp.type]}20`, color: TYPE_COLORS[opp.type] }}>
                    {opp.type}
                  </span>
                  <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg mt-1 transition-all hover:opacity-80"
                    style={{ background: 'var(--card2)', color: 'var(--amber)', border: '1px solid #F5A62340' }}>
                    Apply <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
