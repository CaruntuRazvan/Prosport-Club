const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const User = require('../models/User');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');

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
// POST /api/polls - Create a new poll (manager or staff only)
router.post('/', authMiddleware, isManagerOrStaff, async (req, res) => {
  try {
    const { question, options, expiresAt } = req.body;
    const createdBy = req.user._id;

    // Validate options
    if (!Array.isArray(options) || options.some(opt => typeof opt !== 'string')) {
      return res.status(400).json({ error: 'Opțiunile trebuie să fie un array de string-uri.' });
    }

    // Create poll options with empty votes
    const pollOptions = options.map(text => ({ text, votes: [] }));

    const poll = new Poll({
      question,
      options: pollOptions,
      createdBy,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    console.log(`Creating poll: creatorId=${createdBy}, question="${question}"`);
    await poll.save();
    console.log(`Poll created: pollId=${poll._id}`);

    // Find players, excluding the creator
    const users = await User.find({
      role: 'player', // Doar jucătorii
      _id: { $ne: createdBy }, // Excludem creatorul
    }).select('_id role');

    // Create notifications for players only
    const notifications = users.map(user => ({
      userId: user._id,
      type: 'poll',
      title: 'A fost creat un nou sondaj',
      description: `A fost creat un nou sondaj: "${poll.question}"`,
      actionLink: poll._id.toString(), 
      section: 'polls', 
      createdAt: new Date(),
      isRead: false,
    }));

    // Save notifications
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`Created ${notifications.length} notifications for poll: pollId=${poll._id}`);
    } else {
      console.log(`No notifications created for poll: pollId=${poll._id}`);
    }

    res.status(201).json({ message: 'Sondaj creat cu succes', poll });
  } catch (error) {
    console.error(`Error creating poll: error=${error.message}`);
    res.status(500).json({ error: 'Eroare la crearea sondajului', details: error.message });
  }
});
// POST /api/polls/:id/vote - Vote in a poll (players and staff, but not admins)
router.post('/:id/vote', authMiddleware, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Admins cannot vote
    if (userRole === 'admin') {
      return res.status(403).json({ error: 'Adminii nu pot vota în sondaje.' });
    }

    // Find poll and populate creator
    const poll = await Poll.findById(req.params.id).populate('createdBy', 'name');
    if (!poll) {
      return res.status(404).json({ error: 'Sondajul nu există.' });
    }

    // Check if poll has expired
    if (poll.expiresAt && new Date() > new Date(poll.expiresAt)) {
      return res.status(403).json({ error: 'Sondajul a expirat.' });
    }

    // Check if user has already voted
    const hasVoted = poll.options.some(option =>
      option.votes.some(vote => vote.toString() === userId.toString())
    );
    console.log(`Poll ID: ${poll._id}, User ID: ${userId}, hasVoted: ${hasVoted}`);
    if (hasVoted) {
      return res.status(403).json({ error: 'Ai votat deja în acest sondaj.' });
    }

    // Validate option
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ error: 'Opțiune invalidă.' });
    }

    // Add user's vote
    poll.options[optionIndex].votes.push(userId);
    console.log(`Saving vote: pollId=${poll._id}, userId=${userId}, optionIndex=${optionIndex}`);
    await poll.save();

    // Create notification for poll creator
    const notification = {
      userId: poll.createdBy._id,
      type: 'poll',
      title: 'Vot nou în sondajul tău',
      description: `Utilizatorul ${req.user.name} a votat în sondajul "${poll.question}"`,
      actionLink: poll._id.toString(), 
      section: 'polls', 
      createdAt: new Date(),
      isRead: false,
    };
    await Notification.create(notification);
    console.log(`Notification created for vote: pollId=${poll._id}, creatorId=${poll.createdBy._id}`);

    res.status(200).json({ message: 'Vot înregistrat cu succes.' });
  } catch (error) {
    console.error(`Error voting in poll: pollId=${req.params.id}, error=${error.message}`);
    res.status(500).json({ error: 'Eroare la votare', details: error.message });
  }
});

// GET /api/polls - Get all polls
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let polls;
    if (userRole === 'manager' || userRole === 'staff') {
      polls = await Poll.find({ createdBy: userId })
        .populate('createdBy', 'name')
        .lean();
    } else if (userRole === 'player') {
      polls = await Poll.find({
        $or: [
          { expiresAt: { $gt: new Date() } },
          { expiresAt: { $exists: false } },
        ],
      })
        .populate('createdBy', 'name')
        .lean();
    } else {
      return res.status(403).json({ error: 'Rol necunoscut.' });
    }

    // Add hasVoted information
    polls = polls.map(poll => {
      const hasVoted = poll.options.some(option =>
        option.votes.some(vote => vote.toString() === userId.toString())
      );
      console.log(`Poll ID: ${poll._id}, User ID: ${userId}, hasVoted: ${hasVoted}`);
      return { ...poll, hasVoted };
    });

    console.log(`Fetched ${polls.length} polls for user: userId=${userId}, role=${userRole}`);
    res.json(polls);
  } catch (error) {
    console.error(`Error fetching polls: userId=${req.user._id}, error=${error.message}`);
    res.status(500).json({ error: 'Eroare la preluarea sondajelor', details: error.message });
  }
});

// GET /api/polls/:id - Get a specific poll (for results)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('options.votes', 'name');

    if (!poll) {
      return res.status(404).json({ message: 'Sondajul nu a fost găsit.' });
    }

    // Check user permissions
    if (req.user.role === 'player') {
      const hasVoted = poll.options.some(option =>
        option.votes.some(vote => vote._id.toString() === req.user._id.toString())
      );
      if (!hasVoted) {
        return res.status(403).json({ message: 'Nu ai votat în acest sondaj.' });
      }
    } else if (req.user.role === 'manager' || req.user.role === 'staff') {
      if (poll.createdBy._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Acces interzis.' });
      }
    }

    // Calculate results
    const results = poll.options.map(option => ({
      text: option.text,
      voteCount: option.votes.length,
    }));

    // Detailed votes for manager/staff
    let votesDetails = [];
    if (req.user.role === 'manager' || req.user.role === 'staff') {
      votesDetails = poll.options.flatMap((option, index) =>
        option.votes.map(vote => ({
          user: vote.name,
          option: option.text,
        }))
      );
    }

    console.log(`Fetched poll: pollId=${poll._id}, userId=${req.user._id}`);
    res.status(200).json({
      ...poll.toObject(),
      results,
      votes: votesDetails,
    });
  } catch (error) {
    console.error(`Error fetching poll: pollId=${req.params.id}, error=${error.message}`);
    res.status(500).json({ message: 'Eroare la obținerea sondajului.' });
  }
});

// DELETE /api/polls/:id - Delete a poll (creator only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const pollId = req.params.id;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Sondajul nu există.' });
    }

    if (!poll.createdBy.equals(userId)) {
      return res.status(403).json({ error: 'Doar creatorul sondajului poate șterge acest sondaj.' });
    }

    console.log(`Deleting poll: pollId=${pollId}`);
    await Poll.findByIdAndDelete(pollId);
    console.log(`Poll deleted: pollId=${pollId}`);

    res.status(200).json({ message: 'Sondaj șters cu succes.' });
  } catch (error) {
    console.error(`Error deleting poll: pollId=${req.params.id}, error=${error.message}`);
    res.status(500).json({ error: 'Eroare la ștergerea sondajului', details: error.message });
  }
});

// DELETE /api/polls/reset-all - Șterge toate sondajele
router.delete('/reset-all', authMiddleware, isAdmin, async (req, res) => {
  try {
    // Șterge toate sondajele
    await Poll.deleteMany({});
    console.log('Toate sondajele au fost șterse.');

    // Șterge notificările asociate sondajelor
    await Notification.deleteMany({ type: 'poll' });
    console.log('Notificările asociate sondajelor au fost șterse.');

    res.status(200).json({ message: 'Toate sondajele au fost șterse cu succes.' });
  } catch (error) {
    console.error('Eroare la ștergerea sondajelor:', error);
    res.status(500).json({ message: 'Eroare la ștergerea sondajelor.' });
  }
});

// DELETE /api/polls/reset-user/:userId - Șterge sondajele asociate unui utilizator 
router.delete('/reset-user/:userId', authMiddleware, isAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Șterge sondajele create de utilizator
    const createdPolls = await Poll.find({ createdBy: userId });
    const createdPollIds = createdPolls.map(poll => poll._id);
    const deletedPolls = await Poll.deleteMany({ createdBy: userId });
    console.log(`Șterse ${deletedPolls.deletedCount} sondaje create de utilizatorul ${userId}.`);

    // Șterge voturile utilizatorului din alte sondaje
    const polls = await Poll.find({
      'options.votes': userId,
    });

    let updatedPollsCount = 0;
    for (const poll of polls) {
      poll.options.forEach(option => {
        option.votes = option.votes.filter(vote => vote.toString() !== userId.toString());
      });
      await poll.save();
      updatedPollsCount++;
    }
    console.log(`Șterse voturile utilizatorului ${userId} din ${updatedPollsCount} sondaje.`);

    // Șterge notificările asociate sondajelor create de utilizator

    const deletedCreatedNotifications = await Notification.deleteMany({
      type: 'poll',
      actionLink: { $in: createdPollIds.map(id => id.toString()) }, // Folosim actionLink, ca în ruta pentru evenimente
    });
    console.log(`Șterse ${deletedCreatedNotifications.deletedCount} notificări asociate sondajelor create de utilizatorul ${userId}.`);

    // Șterge notificările primite de utilizator legate de sondaje (ex. notificări de vot)
    const deletedVoteNotifications = await Notification.deleteMany({
      userId,
      type: { $in: ['poll'] }, // Acoperim toate tipurile relevante de notificări
    });
    res.status(200).json({ message: 'Sondajele, voturile și notificările utilizatorului au fost șterse cu succes.' });
  } catch (error) {
    console.error(`Eroare la ștergerea sondajelor utilizatorului ${req.params.userId}:`, error);
    res.status(500).json({ message: 'Eroare la ștergerea sondajelor utilizatorului.' });
  }
});
module.exports = router;