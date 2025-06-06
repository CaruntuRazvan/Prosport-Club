const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const { isManagerOrStaff, isAdmin } = require('../middleware/roleMiddleware');


const isEventAuthorized = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('staff createdBy');
    if (!event) {
      return res.status(404).json({ message: 'Evenimentul nu a fost găsit.' });
    }

    const userId = req.user._id.toString();
    const isCreator = event.createdBy._id.toString() === userId;
    const isStaff = event.staff.some(staffId => staffId.toString() === userId);

    if (!isCreator && !isStaff) {
      return res.status(403).json({ message: 'Nu ai permisiunea de a edita sau șterge acest eveniment.' });
    }

    req.event = event; // Adaugă evenimentul în obiectul request pentru a fi folosit ulterior
    next();
  } catch (error) {
    console.error('Eroare la verificarea autorizației:', error);
    res.status(500).json({ message: 'Eroare la verificarea autorizației.' });
  }
};

// POST /api/events - Creează un eveniment nou (pentru manager sau staff)
router.post('/', auth, isManagerOrStaff, async (req, res) => {
  try {
    const { title, description, startDate, finishDate, players, staff } = req.body;

    // Creează evenimentul
    const event = new Event({
      title,
      description,
      startDate,
      finishDate,
      players,
      staff,
      createdBy: req.user._id,
      status: 'Scheduled',
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Eroare la crearea evenimentului:', error);
    res.status(500).json({ message: error.message || 'Eroare la crearea evenimentului.' });
  }
});

// GET /api/events - Obține evenimentele în funcție de rolul utilizatorului
router.get('/', auth, async (req, res) => {
  try {
    let events;
    const userId = req.user._id;
    const now = new Date();

    // Actualizează statusul evenimentelor care au trecut
    await Event.updateMany(
      {
        status: 'Scheduled',
        finishDate: { $lt: now },
      },
      { $set: { status: 'Finished' } }
    );

    // Obține evenimentele în funcție de rol
    if (req.user.role === 'player') {
      // Pentru jucători, returnăm evenimentele în care sunt incluși în players
      events = await Event.find({ players: userId })
        .populate('players', 'name email')
        .populate('staff', 'name email')
        .populate('createdBy', 'name email');
    } else if (req.user.role === 'manager') {
      // Pentru manageri, returnăm evenimentele create de ei sau în care sunt incluși
      events = await Event.find({
        $or: [{ createdBy: userId }, { staff: userId }],
      })
        .populate('players', 'name email')
        .populate('staff', 'name email')
        .populate('createdBy', 'name email');
    } else if (req.user.role === 'staff') {
      // Pentru staff, returnăm evenimentele în care sunt incluși sau pe care le-au creat
      events = await Event.find({
        $or: [{ staff: userId }, { createdBy: userId }],
      })
        .populate('players', 'name email')
        .populate('staff', 'name email')
        .populate('createdBy', 'name email');
    } else {
      return res.status(403).json({ message: 'Rol neautorizat.' });
    }

    res.status(200).json(events);
  } catch (error) {
    console.error('Eroare la obținerea evenimentelor:', error);
    res.status(500).json({ message: 'Eroare la obținerea evenimentelor.' });
  }
});

// Obține detaliile unui eveniment specific
router.get('/:id', auth, async (req, res) => {
  try {
    const now = new Date();
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email') // Populează creatorul
      .populate('players', 'name email') // Populează jucătorii
      .populate('staff', 'name email'); // Populează staff-ul

    if (!event) {
      return res.status(404).json({ message: 'Evenimentul nu a fost găsit.' });
    }

    // Actualizează statusul dacă finishDate a trecut
    if (event.status === 'Scheduled' && new Date(event.finishDate) < now) {
      event.status = 'Finished';
      await event.save();
    }

    res.status(200).json(event);
  } catch (error) {
    console.error('Eroare la obținerea detaliilor evenimentului:', error);
    res.status(500).json({ message: 'Eroare la obținerea detaliilor evenimentului.' });
  }
});
// PUT /api/events/:id - Editează un eveniment existent
router.put('/:id', auth, isManagerOrStaff, isEventAuthorized, async (req, res) => {
  try {
    const { title, description, startDate, finishDate, status ,players, staff } = req.body;

    // Actualizează evenimentul
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        startDate,
        finishDate,
        status,
        players,
        staff,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    ).populate('players staff createdBy');

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Evenimentul nu a fost găsit.' });
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Eroare la editarea evenimentului:', error);
    res.status(500).json({ message: error.message || 'Eroare la editarea evenimentului.' });
  }
});

// DELETE /api/events/reset-all - Șterge toate evenimentele
router.delete('/reset-all', auth, isAdmin, async (req, res) => {
  try {
    // Șterge toate evenimentele
    await Event.deleteMany({});
    console.log('Toate evenimentele au fost șterse.');

    // Șterge notificările asociate evenimentelor
    await Notification.deleteMany({ type: 'event' });
    console.log('Notificările asociate evenimentelor au fost șterse.');

    res.status(200).json({ message: 'Toate evenimentele și notificările asociate au fost șterse cu succes.' });
  } catch (error) {
    console.error('Eroare la ștergerea evenimentelor:', error);
    res.status(500).json({ message: 'Eroare la ștergerea evenimentelor.' });
  }
});

// DELETE /api/events/:id - Șterge un eveniment existent
router.delete('/:id', auth, isManagerOrStaff, isEventAuthorized, async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);

    if (!deletedEvent) {
      return res.status(404).json({ message: 'Evenimentul nu a fost găsit.' });
    }

    res.status(200).json({ message: 'Evenimentul a fost șters cu succes.' });
  } catch (error) {
    console.error('Eroare la ștergerea evenimentului:', error);
    res.status(500).json({ message: error.message || 'Eroare la ștergerea evenimentului.' });
  }
});



// DELETE /api/events/reset-user/:userId - Șterge evenimentele asociate unui utilizator
router.delete('/reset-user/:userId', auth, isAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Găsește evenimentele create de utilizator sau în care utilizatorul este implicat (ca jucător sau staff)
    const events = await Event.find({
      $or: [
        { createdBy: userId },
        { players: userId },
        { staff: userId },
      ],
    });

    const eventIds = events.map(event => event._id);

    // Șterge evenimentele
    await Event.deleteMany({
      $or: [
        { createdBy: userId },
        { players: userId },
        { staff: userId },
      ],
    });
    console.log(`Șterse ${eventIds.length} evenimente asociate utilizatorului ${userId}.`);

    // Șterge notificările asociate evenimentelor
    await Notification.deleteMany({
      type: 'event',
      actionLink: { $in: eventIds.map(id => id.toString()) },
    });
    console.log(`Șterse notificările asociate evenimentelor utilizatorului ${userId}.`);

    res.status(200).json({ message: 'Evenimentele și notificările asociate utilizatorului au fost șterse cu succes.' });
  } catch (error) {
    console.error(`Eroare la ștergerea evenimentelor utilizatorului ${req.params.userId}:`, error);
    res.status(500).json({ message: 'Eroare la ștergerea evenimentelor utilizatorului.' });
  }
});
module.exports = router;