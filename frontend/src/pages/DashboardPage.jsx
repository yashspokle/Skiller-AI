import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, Target, Zap, ArrowRight, BookOpen, Briefcase } from 'lucide-react';
import { auditAPI, analyticsAPI } from '../services/api';

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([auditAPI.getProfile(), analyticsAPI.userProgress()])
      .then(([p, prog]) => {
        if (p.status === 'fulfilled') setProfile(p.value);
        if (prog.status === 'fulfilled') setProgress(prog.value);
      })
      .finally(() => setLoading(false));
  }, []);

  const radarData = profile
    ? Object.entries(profile.categories || {}).map(([name, cat]) => ({ subject: name.split(' ')[0], score: cat.score }))
    : [];

  const statCard = (icon, label, value, sub, color) => (
    <div className="rounded-2xl p-5 hover-lift" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
      <p className="text-3xl font-bold mb-1" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>{value}</p>
      <p className="text-sm font-medium mb-0.5">{label}</p>
      <p className="text-xs" style={{ color: 'var(--muted)' }}>{sub}</p>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>
          Dashboard 👋
        </h1>
        <p style={{ color: 'var(--muted)' }}>Here's your skills snapshot for today</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64" style={{ color: 'var(--muted)' }}>Loading your profile…</div>
      ) : !profile ? (
        <div className="rounded-2xl p-8 text-center mb-8" style={{ background: 'var(--card)', border: '1px dashed var(--amber)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#F5A62320' }}>
            <Zap size={24} style={{ color: 'var(--amber)' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>Run your first Skill Audit</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Upload your CV to generate your digital skill twin and personalised 12-week roadmap.</p>
          <Link to="/audit" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-black" style={{ background: 'var(--amber)' }}>
            Start Audit <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {statCard(<TrendingUp size={20} />, 'Skill Score', `${profile.overallScore}`, profile.tier, '#F5A623')}
            {statCard(<BookOpen size={20} />, 'Skills Mapped', `${profile.totalSkills}`, 'across all categories', '#4FC3F7')}
            {statCard(<Target size={20} />, '30-Day Projection', `+${(progress?.projection30Days || 0) - profile.overallScore}pts`, 'at current pace', '#00FF94')}
            {statCard(<Briefcase size={20} />, 'Opportunities', '12', 'matched to your skills', '#B39DDB')}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <h2 className="font-semibold mb-4">Skill Radar</h2>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#2a2a40" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#8888AA', fontSize: 12 }} />
                  <Radar name="Skills" dataKey="score" stroke="#F5A623" fill="#F5A623" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <h2 className="font-semibold mb-4">Weekly Progress</h2>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={progress?.weeklyActivity || []}>
                  <XAxis dataKey="week" tick={{ fill: '#8888AA', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8888AA', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#14141f', border: '1px solid #2a2a40', borderRadius: '8px', color: '#E8E8F0' }} />
                  <Line type="monotone" dataKey="hours" stroke="#F5A623" strokeWidth={2.5} dot={{ fill: '#F5A623', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h2 className="font-semibold mb-6">Category Breakdown</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(profile.categories || {}).map(([cat, data]) => (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{cat}</span>
                    <span style={{ color: 'var(--amber)' }}>{data.score}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full skill-bar-fill"
                      style={{ '--target-width': `${data.score}%`, width: `${data.score}%`, background: 'linear-gradient(90deg, #F5A623, #FFD166)' }} />
                  </div>
                  {data.topSkill && <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Top: {data.topSkill}</p>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}