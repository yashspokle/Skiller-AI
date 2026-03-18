const express = require('express');
const { authenticate } = require('../middleware/auth');
const { parseCVSkills, analyseGithubProfile, generateSkillProfile, identifyGaps } = require('../services/skillAuditService');
const { store, uuidv4 } = require('../models/store');

const router = express.Router();

// POST /api/skill-audit/cv
router.post('/cv', authenticate, async (req, res) => {
  try {
    const { cvText, targetRole = 'data-scientist' } = req.body;
    if (!cvText) return res.status(400).json({ error: 'CV text is required' });

    const parsedSkills = parseCVSkills(cvText);
    const skillProfile = generateSkillProfile(parsedSkills, null);
    const gaps = identifyGaps(skillProfile, targetRole);

    const userId = req.user.id;

    const session = {
      id: uuidv4(), userId, source: 'cv',
      targetRole, skillProfile, gaps,
      createdAt: new Date().toISOString()
    };
    store.auditSessions.push(session);

    const existing = store.skillProfiles.findIndex(p => p.userId === userId);
    if (existing >= 0) {
      store.skillProfiles[existing] = {
        ...store.skillProfiles[existing],
        ...skillProfile, targetRole,
        updatedAt: new Date().toISOString()
      };
    } else {
      store.skillProfiles.push({
        id: uuidv4(), userId,
        ...skillProfile, targetRole,
        createdAt: new Date().toISOString()
      });
    }

    res.json({ sessionId: session.id, skillProfile, gaps });
  } catch (err) {
    console.error('CV audit error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/skill-audit/github
router.post('/github', authenticate, async (req, res) => {
  try {
    const { username, targetRole = 'data-scientist' } = req.body;
    if (!username) return res.status(400).json({ error: 'GitHub username required' });

    const githubData = analyseGithubProfile(username);
    const skillProfile = generateSkillProfile({}, githubData);
    const gaps = identifyGaps(skillProfile, targetRole);

    const userId = req.user.id;
    const existing = store.skillProfiles.findIndex(p => p.userId === userId);
    if (existing >= 0) {
      store.skillProfiles[existing] = {
        ...store.skillProfiles[existing],
        ...skillProfile, targetRole,
        updatedAt: new Date().toISOString()
      };
    } else {
      store.skillProfiles.push({
        id: uuidv4(), userId,
        ...skillProfile, targetRole,
        createdAt: new Date().toISOString()
      });
    }

    res.json({ username, githubData, skillProfile, gaps });
  } catch (err) {
    console.error('GitHub audit error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/skill-audit/profile
router.get('/profile', authenticate, (req, res) => {
  const profile = store.skillProfiles.find(p => p.userId === req.user.id);
  if (!profile) return res.status(404).json({ error: 'No skill profile found. Complete an audit first.' });
  res.json(profile);
});

// GET /api/skill-audit/history
router.get('/history', authenticate, (req, res) => {
  const sessions = store.auditSessions.filter(s => s.userId === req.user.id);
  res.json(sessions);
});

module.exports = router;