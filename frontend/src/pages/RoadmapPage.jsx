import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, BookOpen, Code, ClipboardCheck, Calendar, TrendingUp } from 'lucide-react';
import { roadmapAPI } from '../services/api';

const PHASE_COLORS = {
  Foundation: '#4FC3F7',
  Development: '#F5A623',
  Mastery: '#00FF94'
};

const TASK_ICONS = {
  learning: <BookOpen size={14} />,
  practice: <Code size={14} />,
  assessment: <ClipboardCheck size={14} />
};

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    roadmapAPI.getMy()
      .then(setRoadmap)
      .catch(() => setRoadmap(null))
      .finally(() => setLoading(false));
  }, []);

  const toggleWeek = async (week) => {
    if (!roadmap) return;
    try {
      const updated = await roadmapAPI.completeWeek(week);
      setRoadmap(updated);
    } catch {}
  };

  const completedCount = roadmap?.completedWeeks?.length || 0;
  const pct = Math.round((completedCount / 12) * 100);

  if (loading) return <div className="p-8" style={{ color: 'var(--muted)' }}>Loading roadmap…</div>;

  if (!roadmap) return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>Learning Roadmap</h1>
      <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--card)', border: '1px dashed var(--border)' }}>
        <Calendar size={40} className="mx-auto mb-4" style={{ color: 'var(--muted)' }} />
        <p className="font-semibold mb-2">No roadmap yet</p>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Complete a skill audit first to generate your personalised 12-week plan</p>
        <Link to="/audit" className="px-6 py-3 rounded-xl font-semibold text-sm text-black" style={{ background: 'var(--amber)' }}>
          Run Skill Audit
        </Link>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>12-Week Roadmap</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Target: {roadmap.targetRole?.replace(/-/g, ' ')} · Est. completion {new Date(roadmap.estimatedCompletion).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold gradient-text">{pct}%</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>{completedCount}/12 weeks done</p>
        </div>
      </div>

      <div className="h-2.5 rounded-full mb-10 overflow-hidden" style={{ background: 'var(--border)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #F5A623, #FFD166)' }} />
      </div>

      <div className="flex gap-4 mb-8">
        {Object.entries(PHASE_COLORS).map(([phase, color]) => (
          <div key={phase} className="flex items-center gap-2 text-sm">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span style={{ color: 'var(--muted)' }}>{phase}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {roadmap.weeks.map((week) => {
          const done = roadmap.completedWeeks.includes(week.week);
          const isCurrent = week.week === roadmap.currentWeek;
          const phaseColor = PHASE_COLORS[week.phase];

          return (
            <div key={week.week} className="rounded-2xl p-5 transition-all"
              style={{ background: 'var(--card)', border: `1px solid ${isCurrent ? phaseColor : 'var(--border)'}`, opacity: week.week > roadmap.currentWeek + 2 ? 0.6 : 1 }}>
              <div className="flex items-start gap-4">
                <button onClick={() => toggleWeek(week.week)}
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: done ? '#00FF9420' : 'var(--card2)', border: `2px solid ${done ? '#00FF94' : 'var(--border)'}` }}>
                  {done
                    ? <CheckCircle size={20} style={{ color: '#00FF94' }} />
                    : <span className="text-sm font-bold" style={{ color: 'var(--muted)' }}>{week.week}</span>}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${phaseColor}20`, color: phaseColor }}>{week.phase}</span>
                    {isCurrent && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#F5A62320', color: 'var(--amber)' }}>Current</span>
                    )}
                    <span className="text-xs ml-auto flex items-center gap-1" style={{ color: '#00FF94' }}>
                      <TrendingUp size={12} /> {week.estimatedGrowth}
                    </span>
                  </div>

                  <h3 className="font-semibold mb-3">Week {week.week} — {week.theme}</h3>

                  <div className="flex flex-col gap-2">
                    {week.tasks.map((task, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: 'var(--card2)' }}>
                        <div className="mt-0.5" style={{ color: 'var(--amber)' }}>{TASK_ICONS[task.type]}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{task.description}</p>
                        </div>
                        <span className="text-xs whitespace-nowrap" style={{ color: 'var(--muted)' }}>{task.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
