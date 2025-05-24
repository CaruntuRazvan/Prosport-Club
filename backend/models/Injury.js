const mongoose = require('mongoose');

const injurySchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
  },
  type: {
    type: String,
    required: true,
    trim: true, // Ex. „ruptură musculară”, „entorsă glezna”
  },
  injuryDate: {
    type: Date,
    required: true,
  },
  estimatedDuration: {
    type: Number, // Zile
    required: true,
    min: 1,
  },
  status: {
    type: String,
    enum: ['injured', 'recovering', 'resolved'],
    default: 'injured',
  },
  recoveryProgress: {
    type: Number, // 0-100%
    default: 0,
    min: 0,
    max: 100,
  },
  recoveryEndDate: {
    type: Date, // Calculată: injuryDate + estimatedDuration
  },
  activityRestrictions: {
    type: String, 
    trim: true,
  },
  notes: {
    type: String, 
    trim: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware pre-save pentru a calcula recoveryEndDate
injurySchema.pre('save', function (next) {
  if (this.injuryDate && this.estimatedDuration) {
    this.recoveryEndDate = new Date(this.injuryDate.getTime() + this.estimatedDuration * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Injury', injurySchema);