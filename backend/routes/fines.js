const express = require('express');
const router = express.Router();
const Fine = require('../models/Fine');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { Parser } = require('json2csv');

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acces permis doar administratorilor.' });
  }
  next();
};

const isManagerOrStaff = (req, res, next) => {
  if (req.user.role !== 'manager' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Acces permis doar managerilor și staff-ului.' });
  }
  next();
};

// Middleware to check authorization for a specific fine
const isFineAuthorized = async (req, res, next) => {
  try {
    const fine = await Fine.findById(req.params.id).populate('creatorId', 'name');
    if (!fine) {
      return res.status(404).json({ message: 'Fine not found.' });
    }

    const userId = req.user._id.toString();
    const isCreator = fine.creatorId._id.toString() === userId;
    const isReceiver = fine.receiverId.toString() === userId;

    if (!isCreator && !isReceiver) {
      return res.status(403).json({ message: 'Nu ai permisiunea de a accesa această penalizare.' });
    }

    req.fine = fine;
    next();
  } catch (error) {
    console.error(`Error in isFineAuthorized middleware: id=${req.params.id}, error=${error.message}`);
    res.status(500).json({ message: 'Eroare la verificarea autorizației.' });
  }
};

// POST /api/fines - Create a fine (manager or staff only)
router.post('/', auth, isManagerOrStaff, async (req, res) => {
  try {
    const { receiverId, reason, amount, expirationDate } = req.body;
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    const fine = new Fine({
      creatorId: req.user._id,
      receiverId,
      reason,
      amount,
      expirationDate: expirationDate ? new Date(expirationDate) : null,
    });

    console.log(`Creating fine: creatorId=${req.user._id}, receiverId=${receiverId}, amount=${amount}`);
    await fine.save();
    console.log(`Fine created: fineId=${fine._id}`);

    // Create notification for the receiver (player)
    const creator = await User.findById(req.user._id).select('name');
    const creatorName = creator ? creator.name : 'an administrator';
    const notification = {
      userId: fine.receiverId,
      type: 'fine',
      title: 'New Fine Assigned',
      description: `You have received a fine of ${fine.amount} EUR for "${fine.reason}" from ${creatorName}.`,
      actionLink: `/fines/${fine._id}`,
      actionLink: fine._id.toString(), 
      section: 'fines', // Secțiunea țintă
      isRead: false,
      createdAt: new Date(),
      fineId: fine._id,
    };

    await Notification.create(notification);
    console.log(`Notification created for fine creation: fineId=${fine._id}, userId=${fine.receiverId}`);

    res.status(201).json(fine);
  } catch (error) {
    console.error(`Error creating fine: error=${error.message}`);
    res.status(500).json({ message: error.message || 'Eroare la crearea penalizării.' });
  }
});

// PUT /api/fines/:id/request-payment - Player requests payment confirmation
router.put('/:id/request-payment', auth, isFineAuthorized, async (req, res) => {
  try {
    const fine = req.fine;

    if (fine.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Doar jucătorul asociat poate solicita confirmarea plății.' });
    }

    if (fine.isPaid) {
      return res.status(400).json({ message: 'Amenda este deja marcată ca plătită.' });
    }

    if (fine.paymentRequested) {
      return res.status(400).json({ message: 'Solicitarea de plată a fost deja trimisă.' });
    }

    console.log(`Requesting payment for fine: fineId=${fine._id}, userId=${req.user._id}`);
    fine.paymentRequested = true;
    fine.paymentRequestDate = new Date();
    await fine.save();
    console.log(`Payment requested for fine: fineId=${fine._id}`);

    // Create notification for the creator (manager/staff)
    const creator = await User.findById(fine.creatorId).select('name');
    const creatorName = creator ? creator.name : 'an administrator';
    const notification = {
      userId: fine.creatorId,
      type: 'fine_payment_request',
      title: 'Payment Confirmation Requested',
      description: `The player has requested payment confirmation for the fine of ${fine.amount} EUR for "${fine.reason}".`,
      actionLink: fine._id.toString(), // Stochează doar ID-ul penalizării
      section: 'fines', // Secțiunea țintă
      isRead: false,
      createdAt: new Date(),
      fineId: fine._id,
    };

    await Notification.create(notification);
    console.log(`Notification created for payment request: fineId=${fine._id}, userId=${fine.creatorId}`);

    res.status(200).json({ message: 'Solicitare de plată trimisă cu succes.', fine });
  } catch (error) {
    console.error(`Error requesting payment confirmation: fineId=${req.params.id}, error=${error.message}`);
    res.status(500).json({ message: error.message || 'Eroare la solicitarea confirmării plății.' });
  }
});

// PUT /api/fines/:id - Update payment status (creator only)
router.put('/:id', auth, isFineAuthorized, async (req, res) => {
  try {
    const fine = req.fine;

    if (fine.creatorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Doar creatorul amenzii poate confirma plata.' });
    }

    const { isPaid, paymentRequested } = req.body;

    if (isPaid && !fine.paymentRequested) {
      return res.status(400).json({ message: 'Nu există o solicitare de plată pentru această amendă.' });
    }

    const updateFields = {};
    let notification = null;
    const creator = await User.findById(fine.creatorId).select('name');
    const creatorName = creator ? creator.name : 'an administrator';

    if (isPaid !== undefined) {
      updateFields.isPaid = isPaid;
      if (isPaid === true && fine.isPaid === false) {
        // Create notification for payment approval
        notification = {
          userId: fine.receiverId,
          type: 'fine_payment_approved',
          title: 'Fine Payment Approved',
          description: `Your payment for the fine of ${fine.amount} EUR for "${fine.reason}" has been approved by ${creatorName}.`,
          actionLink: fine._id.toString(), 
          section: 'fines', // Secțiunea țintă
          isRead: false,
          createdAt: new Date(),
          fineId: fine._id,
        };
      }
    }

    if (paymentRequested !== undefined) {
      updateFields.paymentRequested = paymentRequested;
      if (paymentRequested === false && fine.paymentRequested === true) {
        // Create notification for payment rejection
        notification = {
          userId: fine.receiverId,
          type: 'fine_payment_rejected',
          title: 'Fine Payment Rejected',
          description: `Your payment request for the fine of ${fine.amount} EUR for "${fine.reason}" has been rejected by ${creatorName}.`,
          actionLink: fine._id.toString(), // Stochează doar ID-ul penalizării
          section: 'fines', // Secțiunea țintă
          isRead: false,
          createdAt: new Date(),
          fineId: fine._id,
        };
      }
    }

    updateFields.lastUpdated = new Date();

    console.log(`Updating fine: fineId=${fine._id}, update=${JSON.stringify(updateFields)}`);
    Object.assign(fine, updateFields);
    await fine.save();
    console.log(`Fine updated: fineId=${fine._id}, isPaid=${fine.isPaid}, paymentRequested=${fine.paymentRequested}`);

    // Save notification if created
    if (notification) {
      await Notification.create(notification);
      console.log(`Notification created for ${notification.type}: fineId=${fine._id}, userId=${notification.userId}`);
    }

    res.status(200).json(fine);
  } catch (error) {
    console.error(`Error updating fine: fineId=${req.params.id}, error=${error.message}`);
    res.status(500).json({ message: error.message || 'Eroare la actualizarea stării de plată.' });
  }
});

// DELETE /api/fines/:id - Delete a fine (creator only)
router.delete('/:id', auth, isManagerOrStaff, isFineAuthorized, async (req, res) => {
  try {
    console.log(`Deleting fine: fineId=${req.params.id}`);
    const deletedFine = await Fine.findByIdAndDelete(req.params.id);

    if (!deletedFine) {
      return res.status(404).json({ message: 'Fine not found.' });
    }

    console.log(`Fine deleted: fineId=${deletedFine._id}`);
    res.status(200).json({ message: 'Fine deleted successfully.' });
  } catch (error) {
    console.error(`Error deleting fine: fineId=${req.params.id}, error=${error.message}`);
    res.status(500).json({ message: error.message || 'Eroare la ștergerea penalizării.' });
  }
});

// GET /api/fines - Get all fines (filtered by role)
router.get('/', auth, async (req, res) => {
  try {
    let fines;
    const userId = req.user._id;
    const now = new Date();

    // Actualizăm amenzile expirate
    await Fine.updateMany(
      { isActive: true, expirationDate: { $lt: now } },
      { $set: { isActive: false } }
    );

    if (req.user.role === 'player') {
      fines = await Fine.find({ receiverId: userId }).populate('creatorId', 'name');
    } else if (req.user.role === 'manager') {
      fines = await Fine.find()
        .populate('creatorId', 'name')
        .populate('receiverId', 'name');
    } else if (req.user.role === 'staff') {
      fines = await Fine.find({ creatorId: userId })
        .populate('creatorId', 'name')
        .populate('receiverId', 'name');
    } else {
      return res.status(403).json({ message: 'Rol neautorizat.' });
    }

    console.log(`Fetched ${fines.length} fines for user: userId=${userId}, role=${req.user.role}`);
    res.status(200).json(fines);
  } catch (error) {
    console.error(`Error fetching fines: userId=${req.user._id}, error=${error.message}`);
    res.status(500).json({ message: 'Eroare la obținerea penalizărilor.' });
  }
});

router.delete('/reset-all', auth, isAdmin, async (req, res) => {
  try {
    // Șterge toate amenzile
    await Fine.deleteMany({});
    console.log('Toate amenzile au fost șterse.');

    // Șterge notificările asociate amenzilor
    await Notification.deleteMany({
      type: { $in: ['fine', 'fine_payment_request', 'fine_payment_approved', 'fine_payment_rejected'] },
    });
    console.log('Notificările asociate amenzilor au fost șterse.');

    res.status(200).json({ message: 'Toate amenzile au fost șterse cu succes.' });
  } catch (error) {
    console.error('Eroare la ștergerea amenzilor:', error);
    res.status(500).json({ message: 'Eroare la ștergerea amenzilor.' });
  }
});

// DELETE /api/fines/reset-user/:userId - Șterge amenzile asociate unui utilizator (doar admin)
router.delete('/reset-user/:userId', auth, isAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Șterge amenzile unde utilizatorul este creatorId sau receiverId
    const fines = await Fine.find({
      $or: [{ creatorId: userId }, { receiverId: userId }],
    });

    await Fine.deleteMany({
      $or: [{ creatorId: userId }, { receiverId: userId }],
    });
    console.log(`Amenzile pentru utilizatorul ${userId} au fost șterse.`);

    // Șterge notificările asociate acelor amenzi
    const deletedNotifications = await Notification.deleteMany({
      type: { $in: ['fine', 'fine_payment_request', 'fine_payment_approved', 'fine_payment_rejected'] },
      actionLink: { $in: fineIds.map(id => id.toString()) }, // Folosim actionLink, ca în ruta pentru evenimente
    });
    console.log(`Șterse ${deletedNotifications.deletedCount} notificări asociate amenzilor utilizatorului ${userId}.`);

    // Șterge notificările primite de utilizator legate de amenzi (ex. notificări de plată)
    const deletedUserNotifications = await Notification.deleteMany({
      userId,
      type: { $in: ['fine', 'fine_payment_request', 'fine_payment_approved', 'fine_payment_rejected'] },
    });
    console.log(`Șterse ${deletedUserNotifications.deletedCount} notificări primite de utilizatorul ${userId} legate de amenzi.`);
    res.status(200).json({ message: 'Amenzile utilizatorului au fost șterse cu succes.' });
  } catch (error) {
    console.error(`Eroare la ștergerea amenzilor utilizatorului ${req.params.userId}:`, error);
    res.status(500).json({ message: 'Eroare la ștergerea amenzilor utilizatorului.' });
  }
});

router.get('/export-csv', auth, async (req, res) => {
  try {
    // Verificăm dacă utilizatorul este manager sau staff
    if (req.user.role !== 'manager' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Acces interzis' });
    }

    // Preluăm amenzile
    const fines = await Fine.find()
      .populate('creatorId', 'name')
      .populate('receiverId', 'name');

    // Filtrăm amenzile pentru staff (doar cele create de ei)
    let filteredFines = fines;
    if (req.user.role === 'staff') {
      filteredFines = fines.filter(fine => fine.creatorId._id.toString() === req.user._id.toString());
    }

    // Definim câmpurile pentru CSV, excluzând paymentRequested
    const fields = [
      { label: 'Creator', value: 'creatorId.name' },
      { label: 'Receiver', value: 'receiverId.name' },
      { label: 'Reason', value: 'reason' },
      { label: 'Amount (EUR)', value: 'amount' },
      { label: 'Paid', value: 'isPaid' },
      { label: 'Expiration Date', value: (row) => row.expirationDate ? new Date(row.expirationDate).toLocaleDateString('ro-RO') : 'N/A' },
      { label: 'Active', value: 'isActive' },
      { label: 'Created At', value: (row) => new Date(row.createdAt).toLocaleDateString('ro-RO') },
      { label: 'Updated At', value: (row) => new Date(row.updatedAt).toLocaleDateString('ro-RO') },
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(filteredFines);

    // Setăm header-ele pentru descărcare
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename="fines-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la exportarea amenzilor în CSV', error: error.message });
  }
});
module.exports = router;