const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  nationality: { type: String, required: true },
  history: [
    {
      club: { type: String, required: true },
      startYear: { type: Number, required: true },
      endYear: { type: Number, required: true },
    }
  ],
  image: { type: String }
});

const Manager = mongoose.model('Manager', managerSchema);
module.exports = Manager;
