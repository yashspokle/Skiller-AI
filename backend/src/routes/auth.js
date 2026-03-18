const express = require('express');
const bcrypt = require('bcryptjs');
const { store, uuidv4 } = require('../models/store');
const { generateToken, authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'professional' } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password required' });

    if (store.users.find(u => u.email === email))
      return res.status(409).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`
    };

    store.users.push(user);

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;
    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = store.users.find(u => u.email === email);

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  const user = store.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

module.exports = router;
