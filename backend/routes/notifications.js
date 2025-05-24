const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// GET /api/notifications/:userId
// Returnează notificările unui utilizator
router.get('/:userId', auth ,async (req, res) => {
  try {
    const userId = req.params.userId;

    // Găsește notificările utilizatorului, ordonate după createdAt (descrescător)
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 }) // Cele mai recente primele
      .exec();

    // Numără notificările necitite
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Eroare la obținerea notificărilor:', error);
    res.status(500).json({ message: 'Eroare la obținerea notificărilor', error: error.message });
  }
});


// PATCH /api/notifications/:id/read
// Marchează o notificare ca citită
router.patch('/:id/read', auth ,async (req, res) => {
  try {
    const notificationId = req.params.id;

    // Găsește și actualizează notificarea
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true } // Returnează documentul actualizat
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notificarea nu a fost găsită' });
    }

    res.status(200).json({ message: 'Notificarea a fost marcată ca citită', notification });
  } catch (error) {
    console.error('Eroare la marcarea notificării ca citită:', error);
    res.status(500).json({ message: 'Eroare la marcarea notificării ca citită', error: error.message });
  }
});

router.patch('/mark-all-read', auth, async (req, res) => {
  try {
    const userId = req.user._id; // Obținem userId din token-ul autentificat

    // Actualizează toate notificările necitite ale utilizatorului
    const result = await Notification.updateMany(
      { userId, isRead: false }, // Doar notificările necitite
      { $set: { isRead: true } }
    );

    res.status(200).json({
      message: 'Toate notificările au fost marcate ca citite',
      modifiedCount: result.modifiedCount, // Numărul de notificări actualizate
    });
  } catch (error) {
    console.error('Eroare la marcarea tuturor notificărilor ca citite:', error);
    res.status(500).json({ message: 'Eroare la marcarea notificărilor ca citite', error: error.message });
  }
});

// Șterge o notificare
router.delete('/:id', auth ,async (req, res) => {
  try {
    const notificationId = req.params.id;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notificarea nu a fost găsită' });
    }

    res.status(200).json({ message: 'Notificarea a fost ștearsă' });
  } catch (error) {
    console.error('Eroare la ștergerea notificării:', error);
    res.status(500).json({ message: 'Eroare la ștergerea notificării', error: error.message });
  }
});
module.exports = router;