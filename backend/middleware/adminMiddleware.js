/**
 * Middleware to restrict route access strictly to admin users.
 * Must be used after verifyToken middleware.
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required. No session found.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Administrator clearance required.' });
  }

  next();
};

module.exports = { isAdmin };
