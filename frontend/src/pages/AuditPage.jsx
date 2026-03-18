import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Github, CheckCircle, AlertCircle, ChevronDown, FileText, File } from 'lucide-react';
import { auditAPI, roadmapAPI } from '../services/api';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Point pdf.js worker to CDN
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const ROLES = [
  { value: 'ml-engineer', label: 'ML Engineer' },
  { value: 'data-scientist', label: 'Data Scientist' },
  { value: 'frontend-engineer', label: 'Frontend Engineer' },
  { value: 'backend-engineer', label: 'Backend Engineer' },
  { value: 'product-manager', label: 'Product Manager' },
  { value: 'devops-engineer', label: 'DevOps Engineer' }
];

const SAMPLE_CV = `John Smith — Software Engineer
Email: john@example.com | GitHub: github.com/johnsmith

EXPERIENCE
Senior Software Engineer — TechCorp (2021–Present)
• Built React frontend applications used by 50k daily users
• Designed REST APIs using Node.js and PostgreSQL
• Implemented CI/CD pipelines with GitHub Actions and Docker
• Deployed services on AWS using Kubernetes and Terraform

Data Engineer — DataCo (2019–2021)
• Developed Python ETL pipelines processing 10M records/day
• Used Apache Spark for large-scale data transformations
• Built Tableau dashboards and SQL reporting layers

SKILLS
Python, JavaScript, React, Node.js, SQL, PostgreSQL,
Docker, Kubernetes, AWS, Terraform, Machine Learning, TensorFlow,
Git, CI/CD, REST APIs, GraphQL, Redis, MongoDB

EDUCATION
BSc Computer Science — University of Edinburgh (2015–2019)`;

// Extract text from PDF using pdf.js
async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  return text;
}

// Extract text from DOCX using mammoth
async function extractDocxText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export default function AuditPage() {
  const [mode, setMode] = useState('cv');
  const [cvText, setCvText] = useState('');
  const [github, setGithub] = useState('');
  const [targetRole, setTargetRole] = useState('data-scientist');
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    setUploadedFileName(file.name);
    setParsing(true);
    setError('');

    try {
      let text = '';
      if (ext === 'pdf') {
        text = await extractPdfText(file);
      } else if (ext === 'docx') {
        text = await extractDocxText(file);
      } else if (ext === 'txt' || ext === 'md') {
        text = await file.text();
      } else {
        setError('Unsupported file type. Please upload PDF, DOCX, TXT, or MD.');
        setParsing(false);
        return;
      }

      if (!text.trim()) {
        setError('Could not extract text from this file. Try a different format.');
        setParsing(false);
        return;
      }

      setCvText(text);
    } catch (err) {
      setError(`Failed to parse file: ${err.message}`);
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      let data;
      if (mode === 'cv') {
        if (!cvText.trim()) { setError('Please paste, upload your CV'); setLoading(false); return; }
        data = await auditAPI.submitCV(cvText, targetRole);
      } else {
        if (!github.trim()) { setError('Please enter a GitHub username'); setLoading(false); return; }
        data = await auditAPI.analyseGithub(github, targetRole);
      }
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Audit failed');
    } finally {
      setLoading(false);
    }
  };

  const generateRoadmap = async () => {
    try {
      await roadmapAPI.generate(targetRole);
      navigate('/roadmap');
    } catch {}
  };

  const inputStyle = {
    background: 'var(--card2)', border: '1px solid var(--border)',
    color: 'var(--text)', borderRadius: '10px', outline: 'none'
  };

  const fileTypeIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <File size={14} style={{ color: '#ff6b6b' }} />;
    if (ext === 'docx') return <FileText size={14} style={{ color: '#4FC3F7' }} />;
    return <FileText size={14} style={{ color: 'var(--muted)' }} />;
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>Skill Audit</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
        Upload your CV (PDF, DOCX, TXT) or connect GitHub to generate your digital skill twin
      </p>

      {!result ? (
        <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {/* Mode tabs */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl w-fit" style={{ background: 'var(--card2)' }}>
            {['cv', 'github'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={mode === m ? { background: 'var(--amber)', color: '#000' } : { color: 'var(--muted)' }}>
                {m === 'cv' ? '📄 CV / Resume' : '🐙 GitHub Profile'}
              </button>
            ))}
          </div>

          {/* Target role */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Target Role</label>
            <div className="relative w-64">
              <select value={targetRole} onChange={e => setTargetRole(e.target.value)}
                className="appearance-none w-full px-4 py-2.5 pr-10 text-sm" style={inputStyle}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-3 pointer-events-none" style={{ color: 'var(--muted)' }} />
            </div>
          </div>

          {mode === 'cv' ? (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--muted)' }}>CV / Resume</label>

              {/* Upload zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl mb-4 cursor-pointer transition-all hover:opacity-80"
                style={{ background: 'var(--card2)', border: '2px dashed var(--border)' }}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--amber)'; }}
                onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                onDrop={e => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = 'var(--border)';
                  const file = e.dataTransfer.files[0];
                  if (file) handleFileUpload({ target: { files: [file] } });
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#ff6b6b20' }}>
                    <File size={20} style={{ color: '#ff6b6b' }} />
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#4FC3F720' }}>
                    <FileText size={20} style={{ color: '#4FC3F7' }} />
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F5A62320' }}>
                    <Upload size={20} style={{ color: 'var(--amber)' }} />
                  </div>
                </div>

                {parsing ? (
                  <p className="text-sm font-medium" style={{ color: 'var(--amber)' }}>⚡ Parsing file…</p>
                ) : uploadedFileName ? (
                  <div className="flex items-center gap-2">
                    {fileTypeIcon(uploadedFileName)}
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{uploadedFileName}</p>
                    <CheckCircle size={14} style={{ color: '#00FF94' }} />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium">Drop your CV here or click to browse</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>Supports PDF, DOCX, TXT, MD</p>
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-xs" style={{ color: 'var(--muted)' }}>or paste text</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>

              <textarea
                value={cvText}
                onChange={e => { setCvText(e.target.value); setUploadedFileName(''); }}
                placeholder="Paste your CV / resume text here…"
                rows={8}
                className="w-full p-4 text-sm font-mono resize-none"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--amber)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              <button onClick={() => { setCvText(SAMPLE_CV); setUploadedFileName(''); }}
                className="mt-2 text-xs" style={{ color: 'var(--amber)' }}>
                ↗ Load sample CV
              </button>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>GitHub Username</label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl w-80"
                style={{ background: 'var(--card2)', border: '1px solid var(--border)' }}>
                <Github size={18} style={{ color: 'var(--muted)' }} />
                <input type="text" value={github} onChange={e => setGithub(e.target.value)}
                  placeholder="e.g. torvalds"
                  className="flex-1 bg-transparent text-sm outline-none" style={{ color: 'var(--text)' }} />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: '#ff6666' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading || parsing}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-black transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--amber)' }}>
            {loading ? 'Analysing…' : '⚡ Run Skill Audit'}
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl"
            style={{ background: '#00FF9420', border: '1px solid #00FF94' }}>
            <CheckCircle size={20} style={{ color: '#00FF94' }} />
            <div>
              <p className="font-semibold text-sm">Audit Complete!</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Overall skill score: {result.skillProfile?.overallScore}% — {result.skillProfile?.tier}
              </p>
            </div>
          </div>

          <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h2 className="font-semibold mb-5">Your Skill Profile</h2>
            <div className="flex flex-col gap-4">
              {Object.entries(result.skillProfile?.categories || {}).map(([cat, data]) => (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{cat}</span>
                    <span style={{ color: 'var(--amber)' }}>{data.score}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full skill-bar-fill"
                      style={{ '--target-width': `${data.score}%`, width: `${data.score}%`, background: 'linear-gradient(90deg, #F5A623, #FFD166)' }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    {Object.keys(data.skills || {}).slice(0, 5).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {result.gaps?.length > 0 && (
            <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <h2 className="font-semibold mb-4">Skill Gaps for {ROLES.find(r => r.value === targetRole)?.label}</h2>
              <div className="flex flex-col gap-3">
                {result.gaps.map((g) => (
                  <div key={g.skill} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'var(--card2)' }}>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{g.skill}</span>
                        <span style={{ color: '#ff6666' }}>Gap: {g.gap}pts</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div className="h-full rounded-full" style={{ width: `${g.currentScore}%`, background: '#ff6666' }} />
                      </div>
                    </div>
                    {g.course && (
                      <a href={g.course.url} target="_blank" rel="noreferrer"
                        className="text-xs px-3 py-1.5 rounded-lg whitespace-nowrap"
                        style={{ background: '#F5A62320', color: 'var(--amber)', border: '1px solid #F5A62340' }}>
                        {g.course.platform}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={generateRoadmap}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-black"
              style={{ background: 'var(--amber)' }}>
              Generate 12-Week Roadmap →
            </button>
            <button onClick={() => { setResult(null); setUploadedFileName(''); setCvText(''); }}
              className="px-6 py-3 rounded-xl font-semibold text-sm"
              style={{ background: 'var(--card2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
              Re-run Audit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}