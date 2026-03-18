const express = require('express');
const { authenticate } = require('../middleware/auth');
const { store, uuidv4 } = require('../models/store');

const enterpriseRouter = express.Router();
const analyticsRouter = express.Router();

// GET /api/enterprise/team-overview
enterpriseRouter.get('/team-overview', authenticate, (req, res) => {
  // Simulated team data for enterprise dashboard
  const teamData = {
    totalEmployees: 248,
    activeUsers: 186,
    avgSkillScore: 67,
    topSkillGaps: ['MLOps', 'Kubernetes', 'Product Strategy', 'TypeScript'],
    departmentBreakdown: [
      { dept: 'Engineering', employees: 89, avgScore: 74, trending: '+5%' },
      { dept: 'Data & Analytics', employees: 42, avgScore: 71, trending: '+8%' },
      { dept: 'Product', employees: 31, avgScore: 63, trending: '+3%' },
      { dept: 'Design', employees: 28, avgScore: 69, trending: '+6%' },
      { dept: 'Operations', employees: 58, avgScore: 55, trending: '+2%' }
    ],
    skillGrowthLast30Days: 6.4,
    coursesCompleted: 341,
    hoursLearned: 2840
  };
  res.json(teamData);
});

// GET /api/analytics/skill-trends
analyticsRouter.get('/skill-trends', authenticate, (req, res) => {
  const trends = {
    risingSkills: [
      { skill: 'MLOps', growth: '+34%', demand: 'Very High' },
      { skill: 'Rust', growth: '+28%', demand: 'High' },
      { skill: 'LLM Engineering', growth: '+67%', demand: 'Critical' },
      { skill: 'Kubernetes', growth: '+22%', demand: 'High' },
      { skill: 'TypeScript', growth: '+19%', demand: 'High' }
    ],
    decliningSkills: [
      { skill: 'jQuery', decline: '-41%' },
      { skill: 'PHP', decline: '-23%' },
      { skill: 'Flash/ActionScript', decline: '-89%' }
    ],
    monthlyGrowth: [
      { month: 'Sep', score: 52 }, { month: 'Oct', score: 55 },
      { month: 'Nov', score: 58 }, { month: 'Dec', score: 57 },
      { month: 'Jan', score: 61 }, { month: 'Feb', score: 65 },
      { month: 'Mar', score: 67 }
    ]
  };
  res.json(trends);
});

// GET /api/analytics/user-progress
analyticsRouter.get('/user-progress', authenticate, (req, res) => {
  const profile = store.skillProfiles.find(p => p.userId === req.user.id);
  res.json({
    currentScore: profile?.overallScore || 0,
    projection30Days: (profile?.overallScore || 0) + Math.round(4 + Math.random() * 6),
    projection90Days: (profile?.overallScore || 0) + Math.round(12 + Math.random() * 15),
    weeklyActivity: [3.5, 5, 4, 6.5, 5.5, 7, 8].map((h, i) => ({ week: `W${i + 1}`, hours: h }))
  });
});

module.exports = { enterpriseRouter, analyticsRouter };
