const jwt = require('jsonwebtoken');

/**
 * REST middleware: reads Bearer token from Authorization header,
 * verifies it and attaches decoded payload to req.user.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, displayName, email, iat, exp }
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

/**
 * Socket.IO middleware: reads token from socket.handshake.auth.token,
 * verifies it and attaches decoded payload to socket.user.
 * Call this with io.use(socketAuthMiddleware).
 */
const socketAuthMiddleware = (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Authentication required: no token provided.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // { userId, displayName, email }
    next();
  } catch (err) {
    return next(new Error('Authentication failed: invalid or expired token.'));
  }
};

module.exports = { verifyToken, socketAuthMiddleware };
