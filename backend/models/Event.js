const mongoose = require('mongoose');
const Notification = require('./Notification');
const PlayerFeedbackSummary = require('./PlayerFeedbackSummary');
const { generateFeedbackSummary } = require('../middleware/openaiService');

// Definim schema pentru Event
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  finishDate: { type: Date, required: true },
  status: { type: String, enum: ['Scheduled', 'Finished'], default: 'Scheduled' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }],
  staff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }],
}, { timestamps: true });

// Funcție pentru a converti satisfactionLevel în valoare numerică
const satisfactionToNumber = (level) => {
  switch (level) {
    case 'good': return 3;
    case 'neutral': return 2;
    case 'bad': return 1;
    default: return 0;
  }
};

// Middleware pre-save pentru validare
eventSchema.pre('save', async function (next) {
  try {
    const event = this;

    if (new Date(event.finishDate) <= new Date(event.startDate)) {
      throw new Error('finishDate trebuie să fie după startDate.');
    }

    if (event.players && event.players.length > 0) {
      const users = await mongoose.model('User').find({ _id: { $in: event.players } });
      const invalidPlayers = users.filter(user => user.role !== 'player' || !user.playerId);
      if (invalidPlayers.length > 0) {
        throw new Error('Unii ID-uri din players nu sunt jucători valizi.');
      }
    }

    if (event.staff && event.staff.length > 0) {
      const users = await mongoose.model('User').find({ _id: { $in: event.staff } });
      const invalidStaff = users.filter(user => user.role !== 'staff' || !user.staffId);
      if (invalidStaff.length > 0) {
        throw new Error('Unii ID-uri din staff nu sunt staff valizi.');
      }
    }

    const creator = await mongoose.model('User').findById(event.createdBy);
    if (creator && !['manager', 'staff'].includes(creator.role)) {
      throw new Error('Evenimentul poate fi creat doar de un manager sau membru al staff-ului.');
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Variabilă pentru a stoca perechile creatorId-receiverId afectate
let affectedFeedbackPairs = [];

// Middleware pre-findOneAndDelete pentru a salva perechile creatorId-receiverId
eventSchema.pre('findOneAndDelete', async function (next) {
  try {
    const event = await this.model.findOne(this.getQuery());
    if (event) {
      const Feedback = mongoose.model('Feedback');
      const feedbacks = await Feedback.find({ eventId: event._id });
      
      // Salvăm perechile creatorId-receiverId afectate
      affectedFeedbackPairs = feedbacks.map(fb => ({
        creatorId: fb.creatorId.toString(),
        receiverId: fb.receiverId.toString(),
      }));

      // Eliminăm duplicatele
      affectedFeedbackPairs = [...new Set(affectedFeedbackPairs.map(pair => `${pair.creatorId}-${pair.receiverId}`))]
        .map(pair => {
          const [creatorId, receiverId] = pair.split('-');
          return { creatorId, receiverId };
        });

      // Ștergem feedback-urile asociate
      await Feedback.deleteMany({ eventId: event._id });
      console.log(`Feedback-urile pentru evenimentul ${event._id} au fost șterse.`);
    }
    next();
  } catch (error) {
    console.error('Eroare la ștergerea feedback-urilor:', error);
    next(error);
  }
});

// Middleware post-findOneAndDelete pentru ștergerea notificărilor și actualizarea PlayerFeedbackSummary
eventSchema.post('findOneAndDelete', async function (doc, next) {
  try {
    const event = doc;
    if (event) {
      // Șterge toate notificările asociate evenimentului
      await Notification.deleteMany({ actionLink: event._id.toString() });
      console.log(`Notificările pentru evenimentul ${event._id} au fost șterse.`);

      // Recalculăm PlayerFeedbackSummary pentru perechile afectate
      const Feedback = mongoose.model('Feedback');
      for (const { creatorId, receiverId } of affectedFeedbackPairs) {
        const remainingFeedbacks = await Feedback.find({
          creatorId,
          receiverId,
        });

        if (remainingFeedbacks.length === 0) {
          // Dacă nu mai există feedback-uri, ștergem PlayerFeedbackSummary
          await PlayerFeedbackSummary.deleteOne({
            creatorId,
            receiverId,
          });
          console.log(`Deleted PlayerFeedbackSummary for creator ${creatorId} and player ${receiverId}`);
        } else {
          // Recalculăm media și rezumatul
          const totalSatisfaction = remainingFeedbacks.reduce((sum, fb) => sum + satisfactionToNumber(fb.satisfactionLevel), 0);
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

          console.log(`Updated PlayerFeedbackSummary after deletion for creator ${creatorId} and player ${receiverId}`);
        }
      }

      // Resetăm perechile afectate pentru a evita reutilizarea accidentală
      affectedFeedbackPairs = [];
    }
    next();
  } catch (error) {
    console.error('Error in Event post-findOneAndDelete middleware:', error);
    next(error);
  }
});
eventSchema.post('save', async function (doc, next) {
  try {
    const event = doc;
    const participants = [...new Set([...event.players, ...event.staff])];
    const startDate = new Date(event.startDate).toLocaleString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const notifications = participants.map(userId => ({
      userId,
      type: 'event',
      title: 'Eveniment nou',
      description: `Ai fost adăugat la un nou eveniment: ${event.title} pe ${startDate}.`,
      actionLink: event._id.toString(), // Stochează doar ID-ul evenimentului
      section: 'calendar', // Secțiunea țintă
      isRead: false,
      createdAt: new Date(),
    }));

    await Notification.insertMany(notifications);
    console.log(`Notificări generate pentru evenimentul ${event._id} către ${participants.length} utilizatori.`);

    next();
  } catch (error) {
    console.error('Eroare la generarea notificărilor:', error);
    next(error);
  }
});

module.exports = mongoose.model('Event', eventSchema);