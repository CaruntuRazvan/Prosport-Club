const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  nationality: { type: String, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  history: [
    {
      club: { type: String, required: true },
      startYear: { type: Number, required: true },
      endYear: { type: Number, required: true },
    }
  ],
  image: { type: String },
  // Atribute noi
  position: { 
    type: String, 
    required: true, 
    enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'] // Poți extinde lista
  },
  shirtNumber: { 
    type: Number,
    min: [1, 'Numărul de tricou trebuie să fie cel puțin 1.'],
    max: [99, 'Numărul de tricou nu poate fi mai mare de 99.'],
    validate: {
      validator: Number.isInteger,
      message: 'Numărul de tricou trebuie să fie un număr întreg.'
    }
  },
  phoneNumber: { type: String },
  preferredFoot: { 
    type: String, 
    required: true, 
    enum: ['right', 'left', 'both'], 
    default: 'right' 
  },
  status: { 
    type: String, 
    enum: ['notInjured', 'recovering', 'injured'], 
    default: 'notInjured' 
  }
}, { timestamps: true });

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;