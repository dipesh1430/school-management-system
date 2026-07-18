const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user and ensure they are active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    // Attach user and tenant info to request object
    // This is the core of our multi-tenancy!
    req.user = user;
    
    if (user.schoolId) {
      req.schoolId = user.schoolId;
    } else if (user.role === 'superadmin') {
      // For MVP demo purposes, let superadmin act on the first school available
      const mongoose = require('mongoose');
      const School = mongoose.models.School || require('../models/School');
      
      let defaultSchool = await School.findOne();
      if (!defaultSchool) {
        defaultSchool = await School.create({ 
          name: 'Default SaaS School', 
          address: '123 Tech Lane', 
          contactEmail: 'admin@schoolsaas.com', 
          domain: 'default.schoolsaas.com' 
        });
      }
      req.schoolId = defaultSchool._id;
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { requireAuth, requireRole };
