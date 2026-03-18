const SKILL_TAXONOMY = {
  'Programming': ['Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Rust', 'C++', 'Ruby', 'Swift', 'Kotlin'],
  'Data & ML': ['Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Statistics', 'Data Visualisation', 'NLP', 'Computer Vision', 'MLOps', 'Spark'],
  'Cloud & DevOps': ['AWS', 'GCP', 'Azure', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Linux', 'Monitoring', 'Security'],
  'Frontend': ['React', 'Vue', 'Angular', 'CSS', 'WebGL', 'Accessibility', 'Performance', 'Testing', 'Design Systems', 'WebAssembly'],
  'Backend': ['Node.js', 'Express', 'FastAPI', 'Django', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST APIs', 'Microservices'],
  'Product & Strategy': ['Product Strategy', 'Roadmapping', 'Stakeholder Management', 'OKRs', 'User Research', 'A/B Testing', 'Agile', 'Data Analysis', 'Go-to-Market', 'P&L Management'],
  'Design': ['Figma', 'UX Research', 'Prototyping', 'Design Thinking', 'Typography', 'Motion Design', 'Accessibility', 'Design Systems', 'Illustration', 'Brand'],
  'Leadership': ['Team Management', 'Hiring', 'Mentoring', 'Strategic Planning', 'Executive Communication', 'Change Management', 'Culture Building', 'Cross-functional Leadership', 'Budget Management', 'Conflict Resolution']
};

const COURSE_LIBRARY = {
  'Python': { platform: 'Coursera', title: 'Python for Everybody', url: 'https://coursera.org', duration: '4 weeks' },
  'Machine Learning': { platform: 'Coursera', title: 'Machine Learning Specialisation', url: 'https://coursera.org', duration: '3 months' },
  'React': { platform: 'Udemy', title: 'The Complete React Developer', url: 'https://udemy.com', duration: '6 weeks' },
  'AWS': { platform: 'AWS Training', title: 'AWS Solutions Architect', url: 'https://aws.training', duration: '8 weeks' },
  'Product Strategy': { platform: 'Reforge', title: 'Product Strategy Programme', url: 'https://reforge.com', duration: '6 weeks' },
  'Kubernetes': { platform: 'Linux Foundation', title: 'CKA Certification Prep', url: 'https://training.linuxfoundation.org', duration: '8 weeks' },
  'TypeScript': { platform: 'Frontend Masters', title: 'TypeScript Fundamentals', url: 'https://frontendmasters.com', duration: '3 weeks' },
  'SQL': { platform: 'Mode Analytics', title: 'SQL Tutorial', url: 'https://mode.com/sql-tutorial', duration: '2 weeks' },
};

// Escape special regex characters (fixes C++, Node.js, etc.)
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseCVSkills(cvText) {
  const extracted = {};
  const textLower = cvText.toLowerCase();

  for (const [category, skills] of Object.entries(SKILL_TAXONOMY)) {
    extracted[category] = {};
    for (const skill of skills) {
      const pattern = escapeRegex(skill.toLowerCase());
      const count = (textLower.match(new RegExp(pattern, 'g')) || []).length;
      if (count > 0) {
        const score = Math.min(100, 40 + count * 12 + Math.random() * 10);
        extracted[category][skill] = Math.round(score);
      }
    }
  }
  return extracted;
}

function analyseGithubProfile(username) {
  const languages = ['JavaScript', 'TypeScript', 'Python', 'Go'].slice(0, Math.floor(Math.random() * 3) + 1);
  const skills = {};
  languages.forEach(lang => {
    skills[lang] = Math.round(60 + Math.random() * 35);
  });
  skills['Git'] = Math.round(70 + Math.random() * 25);
  skills['CI/CD'] = Math.round(50 + Math.random() * 30);
  return { languages, skills, repos: Math.floor(Math.random() * 40) + 5 };
}

function generateSkillProfile(parsedSkills, githubData) {
  const profile = { categories: {} };
  let totalScore = 0;
  let totalSkills = 0;

  for (const [category, skills] of Object.entries(parsedSkills)) {
    const skillEntries = Object.entries(skills);
    if (skillEntries.length === 0) continue;

    const avgScore = skillEntries.reduce((sum, [, s]) => sum + s, 0) / skillEntries.length;
    profile.categories[category] = {
      score: Math.round(avgScore),
      skills: skills,
      topSkill: skillEntries.sort((a, b) => b[1] - a[1])[0]?.[0]
    };
    totalScore += avgScore;
    totalSkills += skillEntries.length;
  }

  if (githubData) {
    for (const [skill, score] of Object.entries(githubData.skills)) {
      for (const category of Object.keys(profile.categories)) {
        if (SKILL_TAXONOMY[category]?.includes(skill)) {
          profile.categories[category].skills[skill] = Math.max(
            profile.categories[category].skills[skill] || 0, score
          );
        }
      }
    }
  }

  const catCount = Object.keys(profile.categories).length;
  profile.overallScore = catCount > 0 ? Math.round(totalScore / catCount) : 42;
  profile.totalSkills = totalSkills;
  profile.tier = profile.overallScore >= 80 ? 'Expert'
    : profile.overallScore >= 60 ? 'Proficient'
    : profile.overallScore >= 40 ? 'Developing' : 'Beginner';

  return profile;
}

function identifyGaps(skillProfile, targetRole) {
  const roleRequirements = {
    'ml-engineer': ['Python', 'TensorFlow', 'MLOps', 'Statistics', 'Docker', 'SQL'],
    'data-scientist': ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Visualisation'],
    'frontend-engineer': ['React', 'TypeScript', 'CSS', 'Testing', 'Performance'],
    'backend-engineer': ['Node.js', 'PostgreSQL', 'Docker', 'REST APIs', 'Redis'],
    'product-manager': ['Product Strategy', 'Data Analysis', 'Agile', 'Stakeholder Management', 'User Research'],
    'devops-engineer': ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Monitoring']
  };

  const required = roleRequirements[targetRole] || roleRequirements['data-scientist'];
  const userSkills = {};

  for (const cat of Object.values(skillProfile.categories)) {
    Object.assign(userSkills, cat.skills || {});
  }

  return required.map(skill => ({
    skill,
    currentScore: userSkills[skill] || 0,
    targetScore: 80,
    gap: Math.max(0, 80 - (userSkills[skill] || 0)),
    course: COURSE_LIBRARY[skill] || null
  })).filter(g => g.gap > 0);
}

module.exports = { parseCVSkills, analyseGithubProfile, generateSkillProfile, identifyGaps, SKILL_TAXONOMY };