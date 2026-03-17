const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    // Development helper: log whether Authorization header is present and mask token
    if (process.env.NODE_ENV === 'development') {
      if (authHeader) {
        const tokenPreview = authHeader.split(' ')[1] ? authHeader.split(' ')[1].substr(0, 8) + '...' : '[no-token]';
        console.log(`[auth-debug] Authorization header present, token preview: ${tokenPreview}`);
      } else {
        console.log('[auth-debug] No Authorization header present');
      }
    }
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        hint: 'Send Authorization: Bearer <token> header. Obtain a token by logging in at /api/auth/login.'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = { authenticateToken };