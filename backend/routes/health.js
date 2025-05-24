const express = require('express');
const router = express.Router();

// GET /api/health
// Returnează statusul aplicației
router.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;