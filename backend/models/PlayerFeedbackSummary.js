// models/PlayerFeedbackSummary.js
const mongoose = require('mongoose');

const playerFeedbackSummarySchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referință la antrenor/staff (cel care a dat feedback-ul)
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referință la jucător (cel care primește feedback-ul)
    required: true,
  },
  averageSatisfaction: {
    type: Number, // Media numerica a satisfactionLevel (ex. 2.5)
    required: true,
    default: 0,
  },
  summary: {
    type: String, // Rezumatul generat de OpenAI
    default: 'No specific observations.',
  },
  feedbackCount: {
    type: Number, // Numărul de feedback-uri luate în calcul
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Indice unic pentru perechea (creatorId, receiverId)
playerFeedbackSummarySchema.index({ creatorId: 1, receiverId: 1 }, { unique: true });

module.exports = mongoose.model('PlayerFeedbackSummary', playerFeedbackSummarySchema);