const express = require('express');
const { authenticate } = require('../middleware/auth');
const { store } = require('../models/store');

const router = express.Router();

// Compute match % between user skills and job requirements
function computeMatch(skillProfile, requiredSkills) {
  if (!skillProfile) return Math.round(20 + Math.random() * 30);
  const userSkills = {};
  for (const cat of Object.values(skillProfile.categories || {})) {
    Object.assign(userSkills, cat.skills || {});
  }
  const matched = requiredSkills.filter(s => (userSkills[s] || 0) >= 50).length;
  return Math.round((matched / requiredSkills.length) * 100);
}

// GET /api/opportunities
router.get('/', authenticate, (req, res) => {
  const { type, minMatch } = req.query;
  const profile = store.skillProfiles.find(p => p.userId === req.user.id);

  let opps = store.opportunities.map(opp => ({
    ...opp,
    match: computeMatch(profile, opp.requiredSkills)
  }));

  if (type) opps = opps.filter(o => o.type === type);
  if (minMatch) opps = opps.filter(o => o.match >= parseInt(minMatch));

  opps.sort((a, b) => b.match - a.match);
  res.json(opps);
});

module.exports = router;
