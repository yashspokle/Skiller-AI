// In-memory store for MVP — replace with PostgreSQL + Neo4j in production
const { v4: uuidv4 } = require('uuid');

const store = {
  users: [],
  skillProfiles: [],
  roadmaps: [],
  opportunities: [],
  auditSessions: []
};

// Seed some sample opportunities
store.opportunities = [
  { id: uuidv4(), title: 'Senior ML Engineer', company: 'DeepMind', type: 'full-time', requiredSkills: ['Python', 'TensorFlow', 'MLOps', 'Statistics'], salary: '£120k–£160k', match: 0 },
  { id: uuidv4(), title: 'Data Scientist', company: 'Palantir', type: 'full-time', requiredSkills: ['Python', 'SQL', 'Machine Learning', 'Data Visualisation'], salary: '£85k–£110k', match: 0 },
  { id: uuidv4(), title: 'Frontend Engineer', company: 'Figma', type: 'full-time', requiredSkills: ['React', 'TypeScript', 'CSS', 'WebGL'], salary: '£90k–£130k', match: 0 },
  { id: uuidv4(), title: 'Product Manager – AI', company: 'Anthropic', type: 'full-time', requiredSkills: ['Product Strategy', 'AI/ML Literacy', 'Roadmapping', 'Stakeholder Management'], salary: '£100k–£140k', match: 0 },
  { id: uuidv4(), title: 'DevOps / Platform Engineer', company: 'Monzo', type: 'full-time', requiredSkills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD'], salary: '£80k–£110k', match: 0 },
  { id: uuidv4(), title: 'AI Research Intern', company: 'Google DeepMind', type: 'internship', requiredSkills: ['Python', 'PyTorch', 'Research', 'Linear Algebra'], salary: '£3k/month', match: 0 },
  { id: uuidv4(), title: 'Freelance Data Analyst', company: 'Self-directed', type: 'gig', requiredSkills: ['SQL', 'Python', 'Tableau', 'Excel'], salary: '£400–£600/day', match: 0 },
];

module.exports = { store, uuidv4 };
