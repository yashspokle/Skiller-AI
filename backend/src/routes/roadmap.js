const express = require('express');
const { authenticate } = require('../middleware/auth');
const { store, uuidv4 } = require('../models/store');
const { identifyGaps } = require('../services/skillAuditService');

const router = express.Router();

function generateWeeklyRoadmap(gaps, targetRole) {
  const weeks = [];
  const totalWeeks = 12;

  // Distribute gaps across 12 weeks
  const prioritisedGaps = [...gaps].sort((a, b) => b.gap - a.gap);

  for (let w = 1; w <= totalWeeks; w++) {
    const phase = w <= 4 ? 'Foundation' : w <= 8 ? 'Development' : 'Mastery';
    const gapIndex = (w - 1) % Math.max(1, prioritisedGaps.length);
    const currentGap = prioritisedGaps[gapIndex];

    const tasks = [];

    if (currentGap) {
      tasks.push({
        type: 'learning',
        title: `${currentGap.skill} — ${phase} Module ${Math.ceil(w / 4)}`,
        description: currentGap.course
          ? `Complete "${currentGap.course.title}" on ${currentGap.course.platform}`
          : `Study ${currentGap.skill} fundamentals via documentation and practice projects`,
        duration: '8–10 hrs',
        resource: currentGap.course
      });
    }

    tasks.push({
      type: 'practice',
      title: 'Hands-on Project',
      description: w % 3 === 0
        ? `Build a portfolio project demonstrating your ${currentGap?.skill || 'new'} skills`
        : `Complete 3 practical exercises and document your progress`,
      duration: '4–6 hrs'
    });

    if (w % 4 === 0) {
      tasks.push({
        type: 'assessment',
        title: 'Phase Review & Skill Assessment',
        description: 'Complete Skiller AI skill assessment to update your digital twin score',
        duration: '1–2 hrs'
      });
    }

    weeks.push({
      week: w,
      phase,
      theme: currentGap?.skill || 'Consolidation',
      tasks,
      estimatedGrowth: `+${Math.round(5 + Math.random() * 8)}%`
    });
  }

  return weeks;
}

// POST /api/roadmap/generate
router.post('/generate', authenticate, (req, res) => {
  try {
    const { targetRole = 'data-scientist' } = req.body;
    const profile = store.skillProfiles.find(p => p.userId === req.user.id);

    if (!profile) return res.status(400).json({ error: 'Complete a skill audit first' });

    const gaps = identifyGaps(profile, targetRole);
    const weeks = generateWeeklyRoadmap(gaps, targetRole);

    const roadmap = {
      id: uuidv4(),
      userId: req.user.id,
      targetRole,
      totalWeeks: 12,
      estimatedCompletion: new Date(Date.now() + 84 * 24 * 60 * 60 * 1000).toISOString(),
      currentWeek: 1,
      completedWeeks: [],
      weeks,
      createdAt: new Date().toISOString()
    };

    // Remove old roadmap and add new
    const idx = store.roadmaps.findIndex(r => r.userId === req.user.id);
    if (idx >= 0) store.roadmaps.splice(idx, 1);
    store.roadmaps.push(roadmap);

    res.json(roadmap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/roadmap/my
router.get('/my', authenticate, (req, res) => {
  const roadmap = store.roadmaps.find(r => r.userId === req.user.id);
  if (!roadmap) return res.status(404).json({ error: 'No roadmap found. Generate one first.' });
  res.json(roadmap);
});

// PATCH /api/roadmap/complete-week/:week
router.patch('/complete-week/:week', authenticate, (req, res) => {
  const roadmap = store.roadmaps.find(r => r.userId === req.user.id);
  if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });

  const week = parseInt(req.params.week);
  if (!roadmap.completedWeeks.includes(week)) {
    roadmap.completedWeeks.push(week);
    roadmap.currentWeek = Math.min(12, Math.max(...roadmap.completedWeeks) + 1);
  }

  res.json(roadmap);
});

module.exports = router;
