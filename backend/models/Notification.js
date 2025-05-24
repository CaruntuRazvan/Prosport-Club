const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  type: { type: String, enum: ['event', 'feedback', 'poll', 'fine','fine_payment_request', 'fine_payment_approved', 'fine_payment_rejected'], required: true }, 
  title: { type: String, required: true }, 
  description: { type: String, required: true }, 
  actionLink: { type: String, required: false }, // id eveniment
  section: { type: String, required: false }, // sectiune in app
  isRead: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now }, 
});

module.exports = mongoose.model('Notification', notificationSchema);