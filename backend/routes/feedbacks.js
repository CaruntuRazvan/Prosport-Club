const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Event = require('../models/Event');
const PlayerFeedbackSummary = require('../models/PlayerFeedbackSummary');
const authMiddleware = require('../middleware/auth');
const { generateFeedbackSummary } = require("../middleware/openaiService");
const Notification = require('../models/Notification');
const User = require('../models/User'); // Adăugăm modelul User
const { isAdmin } = require('../middleware/roleMiddleware'); 


// Ruta pentru adăugarea unui feedback (deja existentă)
router.post('/', authMiddleware, async (req, res) => {
  const { eventId, receiverId, satisfactionLevel, comment } = req.body;
  const creatorId = req.user._id;
  console.log(creatorId)
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Evenimentul nu există' });
    }
    console.log(event.createdBy)
    if (!event.createdBy.equals(creatorId)) {
      return res.status(403).json({ error: 'Doar creatorul evenimentului poate adăuga feedback' });
    }

    if (!event.players.includes(receiverId)) {
      return res.status(400).json({ error: 'Jucătorul nu este implicat în acest eveniment' });
    }

    const existingFeedback = await Feedback.findOne({ eventId, receiverId });
    if (existingFeedback) {
      return res.status(400).json({ error: 'Ai lăsat deja feedback pentru acest jucător în acest eveniment' });
    }

    const feedback = new Feedback({
      eventId,
      creatorId,
      receiverId,
      satisfactionLevel,
      comment,
    });

    await feedback.save();
    res.status(201).json({ message: 'Feedback adăugat cu succes', feedback });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Ai lăsat deja feedback pentru acest jucător în acest eveniment' });
    }
    res.status(500).json({ error: 'Eroare la adăugarea feedback-ului', details: error.message });
  }
});

// DELETE /api/feedback/reset-all - Șterge toate feedback-urile (doar admin)
router.delete('/reset-all', authMiddleware, isAdmin, async (req, res) => {
  try {
    // Șterge toate feedback-urile
    await Feedback.deleteMany({});
    console.log('Toate feedback-urile au fost șterse.');

    // Șterge toate notificările asociate feedback-urilor
    await Notification.deleteMany({ type: 'feedback' });
    console.log('Notificările asociate feedback-urilor au fost șterse.');

    // Șterge toate rezumatele din PlayerFeedbackSummary
    await PlayerFeedbackSummary.deleteMany({});
    console.log('Toate rezumatele PlayerFeedbackSummary au fost șterse.');

    res.status(200).json({ message: 'Toate feedback-urile au fost șterse cu succes.' });
  } catch (error) {
    console.error('Eroare la ștergerea feedback-urilor:', error);
    res.status(500).json({ message: 'Eroare la ștergerea feedback-urilor.' });
  }
});
// Ruta pentru preluarea feedback-urilor pentru un eveniment
router.get('/event/:eventId', authMiddleware, async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role; // Preluăm rolul utilizatorului din token

  console.log('Event ID:', eventId);
  console.log('User ID:', userId);
  console.log('User Role:', userRole);

  try {
    // 1. Verificăm dacă evenimentul există
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Evenimentul nu există' });
    }

    let feedbacks;

    // 2. Gestionăm accesul în funcție de rolul utilizatorului
    if (userRole === 'manager') {
      // Managerii pot vedea feedback-urile doar dacă sunt creatorii evenimentului
      if (!event.createdBy.equals(userId)) {
        return res.status(403).json({ error: 'Doar creatorul evenimentului poate vedea feedback-urile' });
      }
      feedbacks = await Feedback.find({ eventId })
        .populate('receiverId', 'name email firstName lastName')
        .lean();
    } else if (userRole === 'staff') {
      // Staff-ul poate vedea feedback-urile în două situații:
      // a) Este creatorul evenimentului
      // b) Este asociat cu evenimentul (în lista event.staff)
      const isCreator = event.createdBy.equals(userId);
      const isAssociatedStaff = event.staff.some(staffId => staffId.equals(userId));

      if (!isCreator && !isAssociatedStaff) {
        return res.status(403).json({ error: 'Nu ai acces la feedback-urile acestui eveniment' });
      }

      // Staff-ul (fie creator, fie asociat) poate vedea toate feedback-urile
      feedbacks = await Feedback.find({ eventId })
        .populate('receiverId', 'name email firstName lastName')
        .lean();
    } else if (userRole === 'player') {
      // Jucătorii pot vedea doar feedback-ul care îi vizează
      feedbacks = await Feedback.find({ eventId, receiverId: userId })
        .populate('receiverId', 'name email firstName lastName')
        .lean();
    } else {
      return res.status(403).json({ error: 'Rol necunoscut' });
    }

    res.json(feedbacks);
  } catch (error) {
    console.error('Eroare la preluarea feedback-urilor:', error);
    res.status(500).json({ error: 'Eroare la preluarea feedback-urilor', details: error.message });
  }
});

router.get("/summary-by-creator/:creatorId", authMiddleware, async (req, res) => {
  try {
    const { creatorId } = req.params;

    // Verificăm dacă utilizatorul are acces
    if (req.user._id.toString() !== creatorId) {
      return res.status(403).json({ message: "Access denied. You can only view your own feedback reports." });
    }

    // Preluăm toate rezumatele din PlayerFeedbackSummary pentru acest creatorId
    const summaries = await PlayerFeedbackSummary.find({ creatorId })
      .populate('receiverId', 'name firstName lastName') // Populează datele jucătorului
      .lean();

    // Formatăm răspunsul pentru frontend
    const formattedSummaries = summaries.map(summary => ({
      playerId: summary.receiverId._id,
      playerName: summary.receiverId.firstName && summary.receiverId.lastName
        ? `${summary.receiverId.firstName} ${summary.receiverId.lastName}`
        : summary.receiverId.name,
      averageSatisfaction: summary.averageSatisfaction.toFixed(2), // Rotunjim la 2 zecimale
      summary: summary.summary,
      feedbackCount: summary.feedbackCount,
      lastUpdated: summary.lastUpdated,
    }));

    res.status(200).json(formattedSummaries);
  } catch (error) {
    console.error("Error retrieving feedback summaries:", error);
    res.status(500).json({ message: "Error retrieving feedback summaries." });
  }
});

// DELETE /api/feedback/reset-user/:userId - Șterge feedback-urile asociate unui utilizator (doar admin)
router.delete('/reset-user/:userId', authMiddleware, isAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Găsește feedback-urile unde utilizatorul este creatorId sau receiverId
    const feedbacks = await Feedback.find({
      $or: [{ creatorId: userId }, { receiverId: userId }],
    });

    // Șterge feedback-urile
    const deletedFeedbacks = await Feedback.deleteMany({
      $or: [{ creatorId: userId }, { receiverId: userId }],
    });
    console.log(`Șterse ${deletedFeedbacks.deletedCount} feedback-uri asociate utilizatorului ${userId}.`);

    // Șterge notificările asociate feedback-urilor
    const eventIds = feedbacks.map(feedback => feedback.eventId);
    const deletedNotifications = await Notification.deleteMany({
      type: 'feedback',
      actionLink: { $in: eventIds.map(id => id.toString()) },
    });
    console.log(`Șterse ${deletedNotifications.deletedCount} notificări asociate feedback-urilor utilizatorului ${userId}.`);

    // Recalculează PlayerFeedbackSummary pentru perechile afectate
    const affectedPairs = [
      ...new Set(
        feedbacks.map(feedback => ({
          creatorId: feedback.creatorId.toString(),
          receiverId: feedback.receiverId.toString(),
        }))
      ),
    ].map(pair => ({
      creatorId: pair.creatorId,
      receiverId: pair.receiverId,
    }));

    for (const { creatorId, receiverId } of affectedPairs) {
      const remainingFeedbacks = await Feedback.find({
        creatorId,
        receiverId,
      });

      if (remainingFeedbacks.length === 0) {
        await PlayerFeedbackSummary.deleteOne({
          creatorId,
          receiverId,
        });
        console.log(`Deleted PlayerFeedbackSummary for creator ${creatorId} and player ${receiverId}`);
      } else {
        const totalSatisfaction = remainingFeedbacks.reduce(
          (sum, fb) => sum + satisfactionToNumber(fb.satisfactionLevel),
          0
        );
        const averageSatisfaction = totalSatisfaction / remainingFeedbacks.length;

        const comments = remainingFeedbacks.map(fb => fb.comment).filter(c => c);
        let summary = 'No specific observations.';
        if (comments.length > 0) {
          summary = await generateFeedbackSummary(comments);
        }

        await PlayerFeedbackSummary.findOneAndUpdate(
          { creatorId, receiverId },
          {
            averageSatisfaction,
            summary,
            feedbackCount: remainingFeedbacks.length,
            lastUpdated: new Date(),
          },
          { new: true }
        );

        console.log(`Updated PlayerFeedbackSummary for creator ${creatorId} and player ${receiverId}`);
      }
    }

    res.status(200).json({ message: 'Feedback-urile utilizatorului au fost șterse cu succes.' });
  } catch (error) {
    console.error(`Eroare la ștergerea feedback-urilor utilizatorului ${req.params.userId}:`, error);
    res.status(500).json({ message: 'Eroare la ștergerea feedback-urilor utilizatorului.' });
  }
});

// DELETE /api/feedback/summary/reset-all - Șterge toate intrările din PlayerFeedbackSummary (doar admin)
router.delete('/summary/reset-all', authMiddleware, isAdmin, async (req, res) => {
  try {
    await PlayerFeedbackSummary.deleteMany({});
    console.log('Toate rezumatele PlayerFeedbackSummary au fost șterse.');

    res.status(200).json({ message: 'Toate rezumatele feedback-urilor au fost șterse cu succes.' });
  } catch (error) {
    console.error('Eroare la ștergerea rezumatelor feedback-urilor:', error);
    res.status(500).json({ message: 'Eroare la ștergerea rezumatelor feedback-urilor.' });
  }
});

// DELETE /api/feedback/summary/reset-user/:userId - Șterge intrările din PlayerFeedbackSummary asociate unui utilizator (doar admin)
router.delete('/summary/reset-user/:userId', authMiddleware, isAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Șterge intrările din PlayerFeedbackSummary unde utilizatorul este fie creatorId, fie receiverId
    await PlayerFeedbackSummary.deleteMany({
      $or: [{ creatorId: userId }, { receiverId: userId }],
    });
    console.log(`Rezumatele feedback-urilor asociate utilizatorului ${userId} au fost șterse.`);

    res.status(200).json({ message: 'Rezumatele feedback-urilor utilizatorului au fost șterse cu succes.' });
  } catch (error) {
    console.error(`Eroare la ștergerea rezumatelor feedback-urilor utilizatorului ${req.params.userId}:`, error);
    res.status(500).json({ message: 'Eroare la ștergerea rezumatelor feedback-urilor utilizatorului.' });
  }
});
// Funcție pentru a converti satisfactionLevel în valoare numerică (mutată în afara exportului)
function satisfactionToNumber(level) {
  switch (level) {
    case 'good': return 3;
    case 'neutral': return 2;
    case 'bad': return 1;
    default: return 0;
  }
}
module.exports = router;