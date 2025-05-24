const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator'); // Importă validationResult

// Login the user
const loginUser = async (req, res) => {
  // Verifică dacă există erori de validare
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Date invalide', errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email sau parolă incorectă' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Email sau parolă incorectă' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        playerId: user.playerId ? user.playerId._id.toString() : null,
      },
    });
  } catch (error) {
    console.error(`Login error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  loginUser,
};