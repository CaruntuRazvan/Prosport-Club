const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');

// Middleware pentru a verifica dacă utilizatorul este manager sau admin
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
// GET /api/announcements - Listează ultimele 5 anunțuri active
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching last 5 active announcements');
    const announcements = await Announcement.find({ isActive: true })
      .populate('createdBy', 'name')
      .sort({ date: -1 }) // Sortare descrescătoare după dată
      .limit(5); // Limitează la 5 rezultate
    console.log('Announcements retrieved:', announcements.length);
    res.status(200).json(announcements);
  } catch (error) {
    console.error('Eroare la preluarea anunțurilor:', error);
    res.status(500).json({ error: 'Eroare la preluarea anunțurilor.', details: error.message });
  }
});

// POST /api/announcements - Creează un anunț nou
router.post(
  '/',
  [
    authMiddleware,
    isManagerOrAdmin,
    body('title').notEmpty().trim().withMessage('Titlul este obligatoriu.'),
    body('description').notEmpty().trim().withMessage('Descrierea este obligatorie.'),
    body('date').isISO8601().toDate().withMessage('Data trebuie să fie validă.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, date } = req.body;
    console.log('Creating announcement:', { title, description, date });

    try {
      const announcement = new Announcement({
        title,
        description,
        date,
        createdBy: req.user._id,
      });

      const savedAnnouncement = await announcement.save();
      console.log('Announcement created:', savedAnnouncement._id);
      res.status(201).json({ message: 'Anunț creat cu succes.', announcement: savedAnnouncement });
    } catch (error) {
      console.error('Eroare la crearea anunțului:', error);
      res.status(500).json({ error: 'Eroare la crearea anunțului.', details: error.message });
    }
  }
);

// PUT /api/announcements/:id - Editează un anunț
router.put(
  '/:id',
  [
    authMiddleware,
    isManagerOrAdmin,
    body('title').optional().notEmpty().trim().withMessage('Titlul nu poate fi gol.'),
    body('description').optional().notEmpty().trim().withMessage('Descrierea nu poate fi goală.'),
    body('date').optional().isISO8601().toDate().withMessage('Data trebuie să fie validă.'),
    body('isActive').optional().isBoolean().withMessage('Starea trebuie să fie booleană.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, date, isActive } = req.body;
    console.log('Updating announcement:', id, { title, description, date, isActive });

    try {
      const announcement = await Announcement.findById(id);
      if (!announcement) {
        console.error('Announcement not found:', id);
        return res.status(404).json({ error: 'Anunțul nu există.' });
      }

      if (title) announcement.title = title;
      if (description) announcement.description = description;
      if (date) announcement.date = date;
      if (isActive !== undefined) announcement.isActive = isActive;

      const updatedAnnouncement = await announcement.save();
      console.log('Announcement updated:', updatedAnnouncement._id);
      res.status(200).json({ message: 'Anunț actualizat cu succes.', announcement: updatedAnnouncement });
    } catch (error) {
      console.error('Eroare la actualizarea anunțului:', error);
      res.status(500).json({ error: 'Eroare la actualizarea anunțului.', details: error.message });
    }
  }
);

// DELETE /api/announcements/:id - Șterge un anunț
router.delete('/:id', [authMiddleware, isManagerOrAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting announcement:', id);

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      console.error('Announcement not found:', id);
      return res.status(404).json({ error: 'Anunțul nu există.' });
    }

    await announcement.deleteOne();
    console.log('Announcement deleted:', id);
    res.status(200).json({ message: 'Anunț șters cu succes.' });
  } catch (error) {
    console.error('Eroare la ștergerea anunțului:', error);
    res.status(500).json({ error: 'Eroare la ștergerea anunțului.', details: error.message });
  }
});

module.exports = router;