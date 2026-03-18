// No auth — all requests pass through as guest
const authenticate = (req, res, next) => {
  req.user = { id: 'guest', email: 'guest@skiller.ai', role: 'professional' };
  next();
};

module.exports = { authenticate };