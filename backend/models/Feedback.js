const mongoose = require('mongoose');
const Notification = require('./Notification');
const PlayerFeedbackSummary = require('./PlayerFeedbackSummary');
const { generateFeedbackSummary } = require('../middleware/openaiService');

const feedbackSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event', // Referință la colecția Event
    required: true,
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referință la colecția User (antrenorul care a creat evenimentul)
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referință la colecția User (jucătorul pentru care se dă feedback-ul)
    required: true,
  },
  satisfactionLevel: {
    type: String,
    enum: ['good', 'neutral', 'bad'], // Doar aceste valori sunt permise
    required: true,
    default: 'neutral', // Valoare implicită
  },
  comment: {
    type: String,
    trim: true, // Elimină spațiile inutile
    default: '', // Comentariul este opțional
  },
}, { timestamps: true }); // Adaugă createdAt și updatedAt automat

//feedback unic
feedbackSchema.index({ eventId: 1, receiverId: 1 }, { unique: true });

// Funcție pentru a converti satisfactionLevel în valoare numerică
const satisfactionToNumber = (level) => {
  switch (level) {
    case 'good': return 3;
    case 'neutral': return 2;
    case 'bad': return 1;
    default: return 0;
  }
};

feedbackSchema.post('save', async function (doc, next) {
  try {
    const feedback = doc;

    // Generăm notificarea (cod existent)
    const event = await mongoose.model('Event').findById(feedback.eventId);
    if (!event) {
      throw new Error('Event not found for feedback.');
    }

    const startDate = new Date(event.startDate).toLocaleString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const notification = {
      userId: feedback.receiverId,
      type: 'feedback',
      title: 'New Feedback Received',
      description: `You received a new feedback for the event: ${event.title} on ${startDate}.`,
      actionLink: feedback.eventId.toString(), 
      section: 'calendar', 
      isRead: false,
      createdAt: new Date(),
    };

    await Notification.create(notification);
    console.log(`Notification generated for feedback ${feedback._id} to user ${feedback.receiverId}.`);

    // Actualizăm PlayerFeedbackSummary pentru perechea (creatorId, receiverId)
    const feedbacks = await mongoose.model('Feedback').find({
      creatorId: feedback.creatorId,
      receiverId: feedback.receiverId,
    });

    // Calculăm media satisfactionLevel
    const totalSatisfaction = feedbacks.reduce((sum, fb) => sum + satisfactionToNumber(fb.satisfactionLevel), 0);
    const averageSatisfaction = feedbacks.length > 0 ? totalSatisfaction / feedbacks.length : 0;

    // Generăm rezumatul cu OpenAI doar pentru comentariile acestui jucător
    const comments = feedbacks.map(fb => fb.comment).filter(c => c);
    let summary = 'No specific observations.';
    if (comments.length > 0) {
      summary = await generateFeedbackSummary(comments);
    }

    // Actualizăm sau creăm PlayerFeedbackSummary
    await PlayerFeedbackSummary.findOneAndUpdate(
      { creatorId: feedback.creatorId, receiverId: feedback.receiverId },
      {
        averageSatisfaction,
        summary,
        feedbackCount: feedbacks.length,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log(`Updated PlayerFeedbackSummary for creator ${feedback.creatorId} and player ${feedback.receiverId}`);

    next();
  } catch (error) {
    console.error('Error in Feedback post-save middleware:', error);
    next(error);
  }
});
// Middleware post('findOneAndDelete') pentru a șterge notificările și a actualiza PlayerFeedbackSummary
feedbackSchema.post('findOneAndDelete', { document: true, query: false }, async function (doc, next) {
  try {
    const feedback = doc;

    // Ștergem notificările (cod existent)
    await Notification.deleteMany({
      userId: feedback.receiverId,
      type: 'feedback',
      actionLink: feedback.eventId.toString(),
    });
    console.log(`Notifications for feedback ${feedback._id} have been deleted.`);

    // Recalculăm PlayerFeedbackSummary pentru perechea (creatorId, receiverId)
    const remainingFeedbacks = await mongoose.model('Feedback').find({
      creatorId: feedback.creatorId,
      receiverId: feedback.receiverId,
    });

    if (remainingFeedbacks.length === 0) {
      // Dacă nu mai există feedback-uri, ștergem PlayerFeedbackSummary
      await PlayerFeedbackSummary.deleteOne({
        creatorId: feedback.creatorId,
        receiverId: feedback.receiverId,
      });
      console.log(`Deleted PlayerFeedbackSummary for creator ${feedback.creatorId} and player ${feedback.receiverId}`);
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
        { creatorId: feedback.creatorId, receiverId: feedback.receiverId },
        {
          averageSatisfaction,
          summary,
          feedbackCount: remainingFeedbacks.length,
          lastUpdated: new Date(),
        },
        { new: true }
      );

      console.log(`Updated PlayerFeedbackSummary after deletion for creator ${feedback.creatorId} and player ${feedback.receiverId}`);
    }

    next();
  } catch (error) {
    console.error('Error in Feedback post-findOneAndDelete middleware:', error);
    next(error);
  }
});
module.exports = mongoose.model('Feedback', feedbackSchema);