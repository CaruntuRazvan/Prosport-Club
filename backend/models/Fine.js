const mongoose = require('mongoose');
const Notification = require('./Notification');
const User = require('./User');

const fineSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      trim: true,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  
    isPaid: {
      type: Boolean,
      default: false,
    },
    paymentRequested: {
      type: Boolean,
      default: false, 
    },
    expirationDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Middleware post-findOneAndDelete pentru ștergerea notificărilor
fineSchema.post('findOneAndDelete', async function (doc, next) {
  console.log('Middleware post-findOneAndDelete pentru Fine a fost apelat.');
  try {
    if (!doc) {
      console.log('Documentul Fine nu a fost găsit în middleware.');
      return next();
    }

    const fine = doc;

    // Ștergem notificările asociate
    const deletedNotifications = await Notification.deleteMany({
      $or: [
        { userId: fine.receiverId },
        { userId: fine.creatorId },
      ],
      type: { $in: ['fine', 'fine_payment_request', 'fine_payment_approved', 'fine_payment_rejected'] },
      actionLink: fine._id.toString(),
    });

    console.log(`Deleted ${deletedNotifications.deletedCount} notifications for fine ${fine._id}`);

    next();
  } catch (error) {
    console.error('Error in Fine post-findOneAndDelete middleware:', error);
    next(error);
  }
});
module.exports = mongoose.model('Fine', fineSchema);