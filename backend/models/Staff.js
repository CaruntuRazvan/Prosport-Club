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
      club: { type: String },
      startYear: { type: Number },
      endYear: { type: Number },
    }
  ],
    certifications: [{ name: String, year: Number }], // Diplome, licențe, cursuri
    image: { type: String }
});

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;
