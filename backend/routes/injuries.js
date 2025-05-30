const express = require('express');
const router = express.Router();
const Injury = require('../models/Injury');
const User = require('../models/User');
const Player = require('../models/Player');
const { syncPlayerStatus } = require('../middleware/playerStatus');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { isStaff } = require('../middleware/roleMiddleware');

// GET /api/injuries - Listează accidentările active
router.get('/', auth, isStaff, async (req, res) => {
  try {
    const injuries = await Injury.find({ status: { $in: ['injured', 'recovering'] } })
      .populate('playerId', 'firstName lastName')
      .populate('updatedBy', 'name');
    res.status(200).json(injuries);
  } catch (error) {
    console.error('Eroare la obținerea accidentărilor:', error);
    res.status(500).json({ message: 'Eroare la obținerea accidentărilor.', error: error.message });
  }
});

// POST /api/injuries - Creează o accidentare nouă
router.post(
  '/',
  [
    auth,
    isStaff,
    body('playerId').isMongoId().withMessage('ID-ul jucătorului trebuie să fie valid'),
    body('type').notEmpty().trim().withMessage('Tipul accidentării este obligatoriu'),
    body('injuryDate').isISO8601().toDate().withMessage('Data accidentării trebuie să fie validă'),
    body('estimatedDuration').isInt({ min: 1 }).withMessage('Durata estimată trebuie să fie un număr pozitiv'),
    body('activityRestrictions').optional().trim(),
    body('notes').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { playerId, type, injuryDate, estimatedDuration, activityRestrictions, notes } = req.body;

    try {
      const player = await Player.findById(playerId);
      if (!player) {
        return res.status(404).json({ message: 'Jucătorul nu a fost găsit.' });
      }

      const injury = new Injury({
        playerId,
        type,
        injuryDate,
        estimatedDuration,
        status: 'injured',
        activityRestrictions: activityRestrictions || 'Odihnă completă',
        notes,
        updatedBy: req.user.id,
      });

      const savedInjury = await injury.save();
      await syncPlayerStatus(playerId);

      res.status(201).json({
        message: 'Accidentare creată cu succes!',
        injury: await Injury.findById(savedInjury._id).populate('playerId', 'firstName lastName'),
      });
    } catch (error) {
      console.error('Eroare la crearea accidentării:', error);
      res.status(500).json({ message: 'Eroare la crearea accidentării.', error: error.message });
    }
  }
);

// PUT /api/injuries/:id - Actualizează o accidentare
router.put(
  '/:id',
  [
    auth,
    isStaff,
    body('type').optional().notEmpty().trim().withMessage('Tipul accidentării nu poate fi gol'),
    body('injuryDate').optional().isISO8601().toDate().withMessage('Data accidentării trebuie să fie validă'),
    body('estimatedDuration').optional().isInt({ min: 1 }).withMessage('Durata estimată trebuie să fie un număr pozitiv'),
    body('status').optional().isIn(['injured', 'recovering', 'resolved']).withMessage('Starea trebuie să fie validă'),
    body('recoveryProgress').optional().isInt({ min: 0, max: 100 }).withMessage('Progresul trebuie să fie între 0 și 100'),
    body('activityRestrictions').optional().trim(),
    body('notes').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { type, injuryDate, estimatedDuration, status, recoveryProgress, activityRestrictions, notes } = req.body;

    try {
      const injury = await Injury.findById(id);
      if (!injury) {
        return res.status(404).json({ message: 'Accidentarea nu a fost găsită.' });
      }

      if (type) injury.type = type;
      if (injuryDate) injury.injuryDate = injuryDate;
      if (estimatedDuration) injury.estimatedDuration = estimatedDuration;
      if (status) injury.status = status;
      if (recoveryProgress !== undefined) injury.recoveryProgress = recoveryProgress;
      if (activityRestrictions) injury.activityRestrictions = activityRestrictions;
      if (notes) injury.notes = notes;
      injury.updatedBy = req.user.id;
      injury.updatedAt = Date.now();

      const updatedInjury = await injury.save();
      await syncPlayerStatus(injury.playerId);

      res.status(200).json({
        message: 'Accidentare actualizată cu succes!',
        injury: await Injury.findById(updatedInjury._id).populate('playerId', 'firstName lastName'),
      });
    } catch (error) {
      console.error('Eroare la actualizarea accidentării:', error);
      res.status(500).json({ message: 'Eroare la actualizarea accidentării.', error: error.message });
    }
  }
);

module.exports = router;