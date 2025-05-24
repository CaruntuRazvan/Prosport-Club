const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'manager', 'staff', 'player'] },
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: false, }, // Referință către colecția `players`
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager', required: false }, // Referință către colecția `managers`
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: false } // Referință către colecția `staff`
}, { timestamps: true });

// Middleware pre-findOneAndDelete pentru a șterge documentul din Players
userSchema.pre('findOneAndDelete', async function (next) {
  try {
    const user = await this.model.findOne(this.getFilter()); // Găsește user-ul care va fi șters
    if (user && user.playerId) {
      // Șterge documentul din Players asociat cu playerId
      await mongoose.model('Player').deleteOne({ _id: user.playerId });
    }
    if (user && user.managerId) {
      // Șterge documentul din Players asociat cu playerId
      await mongoose.model('Manager').deleteOne({ _id: user.managerId });
    }
    if (user && user.staffId) {
      // Șterge documentul din Players asociat cu playerId
      await mongoose.model('Staff').deleteOne({ _id: user.staffId });
    }
    next();
  } catch (error) {
    next(error);
  }
});
const User = mongoose.model('User', userSchema);

module.exports = User;
