const mongoose = require('mongoose');
const Notification = require('./Notification');

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [
    {
      text: { type: String, required: true },
      votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Lista utilizatorilor care au votat pentru această opțiune
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: false }, // Data de expirare a sondajului (opțional)
  deleteAt: { type: Date },
}, { timestamps: true });

// Validare: Asigură-te că există cel puțin 2 opțiuni
//se sterg poll-urile automat dupa 12 luni
pollSchema.pre('save', function (next) {
  if (this.options.length < 2) {
    return next(new Error('Un sondaj trebuie să aibă cel puțin 2 opțiuni.'));
  }
  // Dacă există expiresAt, setează deleteAt la expiresAt + 1 lună
  if (this.expiresAt) {
    const expiresAtDate = new Date(this.expiresAt);
    this.deleteAt = new Date(expiresAtDate.setMonth(expiresAtDate.getMonth() + 12));
  }
  next();
});

// Middleware pentru a șterge notificările asociate atunci când un sondaj este șters
pollSchema.pre('findOneAndDelete', async function (next) {
  try {
    // Obținem ID-ul sondajului din condiția de interogare
    const pollId = this.getFilter()['_id'];
    if (!pollId) {
      return next();
    }

    // Ștergem toate notificările care au type: 'poll' și actionLink egal cu ID-ul sondajului
    await Notification.deleteMany({
      type: 'poll',
      actionLink: pollId.toString(),
    });
    console.log(`Notificările pentru sondajul ${pollId} au fost șterse.`);

    next();
  } catch (error) {
    console.error('Eroare la ștergerea notificărilor asociate sondajului:', error);
    next(error);
  }
});
// Documentul va fi șters automat după ce deleteAt trece 
pollSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model('Poll', pollSchema);