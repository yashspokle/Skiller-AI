import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, TrendingUp, BookOpen, Clock } from 'lucide-react';
import { enterpriseAPI, analyticsAPI } from '../services/api';

export default function EnterprisePage() {
  const [team, setTeam] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([enterpriseAPI.teamOverview(), analyticsAPI.trends()])
      .then(([t, tr]) => {
        if (t.status === 'fulfilled') setTeam(t.value);
        if (tr.status === 'fulfilled') setTrends(tr.value);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8" style={{ color: 'var(--muted)' }}>Loading enterprise dashboard…</div>;

  const stats = [
    { icon: <Users size={20} />, label: 'Total Employees', value: team?.totalEmployees, color: '#4FC3F7' },
    { icon: <TrendingUp size={20} />, label: 'Avg Skill Score', value: `${team?.avgSkillScore}%`, color: '#F5A623' },
    { icon: <BookOpen size={20} />, label: 'Courses Completed', value: team?.coursesCompleted, color: '#00FF94' },
    { icon: <Clock size={20} />, label: 'Hours Learned', value: `${team?.hoursLearned?.toLocaleString()}h`, color: '#B39DDB' }
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>Enterprise Dashboard</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>Organisation-wide skills intelligence</p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon, label, value, color }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}20`, color }}>
              {icon}
            </div>
            <p className="text-2xl font-bold mb-1" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>{value}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="font-semibold mb-4">Avg Score by Department</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={team?.departmentBreakdown}>
              <XAxis dataKey="dept" tick={{ fill: '#8888AA', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#8888AA', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#14141f', border: '1px solid #2a2a40', borderRadius: '8px', color: '#E8E8F0' }} />
              <Bar dataKey="avgScore" fill="#F5A623" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="font-semibold mb-4">Org Skill Score Over Time</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trends?.monthlyGrowth}>
              <XAxis dataKey="month" tick={{ fill: '#8888AA', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[45, 75]} tick={{ fill: '#8888AA', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#14141f', border: '1px solid #2a2a40', borderRadius: '8px', color: '#E8E8F0' }} />
              <Line type="monotone" dataKey="score" stroke="#4FC3F7" strokeWidth={2.5} dot={{ fill: '#4FC3F7', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="font-semibold mb-4">Top Org-Wide Skill Gaps</h2>
          <div className="flex flex-col gap-3">
            {team?.topSkillGaps?.map((skill, i) => (
              <div key={skill} className="flex items-center gap-3">
                <span className="text-xs font-mono w-5" style={{ color: 'var(--muted)' }}>#{i + 1}</span>
                <span className="flex-1 text-sm font-medium">{skill}</span>
                <span className="text-xs px-2 py-1 rounded-lg" style={{ background: '#ff444420', color: '#ff8888' }}>Gap</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="font-semibold mb-4">🔥 Rising Market Skills</h2>
          <div className="flex flex-col gap-3">
            {trends?.risingSkills?.map((s) => (
              <div key={s.skill} className="flex items-center gap-3">
                <span className="flex-1 text-sm font-medium">{s.skill}</span>
                <span className="text-xs font-semibold" style={{ color: '#00FF94' }}>{s.growth}</span>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: s.demand === 'Critical' ? '#ff444420' : '#F5A62320', color: s.demand === 'Critical' ? '#ff8888' : 'var(--amber)' }}>
                  {s.demand}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
