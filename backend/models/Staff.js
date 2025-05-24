const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  nationality: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['Fitness Coach', 'Goalkeeping Coach', 'Set Piece Coach', 'Assistant Coach', 'Nutritionist', 'Video Analyst', 'Physiotherapist']
  },
  history: [
    {
      club: { type: String, required: true },
      startYear: { type: Number, required: true },
      endYear: { type: Number, required: true },
    }
  ],
    certifications: [{ name: String, year: Number }], // Diplome, licențe, cursuri
    image: { type: String }
});

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;
