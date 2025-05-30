const User = require('../models/User');

const isManagerOrAdmin = async (req, res, next) => {
    try {
      console.log('Checking user role for ID:', req.user._id);
      const user = await User.findById(req.user._id);
      if (!user) {
        console.error('User not found for ID:', req.user._id);
        return res.status(404).json({ error: 'Utilizatorul nu există.' });
      }
      if (!['manager', 'admin'].includes(user.role)) {
        console.error('Access denied. User role:', user.role);
        return res.status(403).json({ error: 'Acces permis doar managerilor sau adminilor.' });
      }
      console.log('User role verified:', user.role);
      next();
    } catch (error) {
      console.error('Eroare la verificarea rolului:', error);
      res.status(500).json({ error: 'Eroare la verificarea rolului.', details: error.message });
    }
};
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acces permis doar administratorilor.' });
  }
  next();
};

const isStaff = (req, res, next) => {
    if (req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Acces permis doar membrilor staff.' });
    }
    next();
};
  
// Middleware pentru a verifica dacă utilizatorul este manager sau staff
const isManagerOrStaff = (req, res, next) => {
  if (req.user.role !== 'manager' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Acces permis doar managerilor și staff-ului.' });
  }
  next();
};
module.exports = { isManagerOrAdmin, isAdmin, isStaff, isManagerOrStaff };