const express = require("express");
const morgan = require("morgan"); // logging
const usersRoutes = require("./routes/users"); // Ruta utilizatori
const eventsRoutes = require('./routes/events'); // Ruta evenimente
const feedbacksRoutes = require('./routes/feedbacks'); // Ruta feedback-uri
const pollsRoutes = require('./routes/polls'); // Ruta sondaje
const finesRoutes = require('./routes/fines'); // Ruta penalizări
const notificationsRoutes = require('./routes/notifications'); // Ruta notificări
const healthRoutes = require('./routes/health'); // Ruta sănătate
const injuriesRoutes = require('./routes/injuries'); // Ruta accidentări
const announcementsRoutes = require('./routes/announcements'); // Ruta anunțuri
//const { updateEventStatus, cleanOldNotifications, backupMongoDBMonthly, cleanOldBackups } = require('./middleware/cronJobs');

const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors()); 

// Servește fișierele statice din folderul uploads
app.use('/uploads', express.static('uploads'));
// Middleware
app.use(express.json()); // Parsare JSON
app.use(morgan("dev")); // Logging (opțional)

// Rute
app.use('/api/events', eventsRoutes);
app.use("/api/users", usersRoutes); 
app.use('/api/feedbacks', feedbacksRoutes); 
app.use('/api/polls', pollsRoutes); 
app.use('/api/notifications', notificationsRoutes);
app.use('/api/fines', finesRoutes); 
app.use('/api/health', healthRoutes); 
app.use('/api/injuries', injuriesRoutes);
app.use('/api/announcements', announcementsRoutes); 

let cachedQuote = null;
let cacheDate = null;

app.get('/api/quote', async (req, res) => {
  const today = new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago' });

  if (cachedQuote && cacheDate === today) {
    console.log('Returning cached quote');
    return res.json(cachedQuote);
  }

  try {
    const response = await fetch('https://zenquotes.io/api/today');
    const text = await response.text();
    console.log('Raw response from zenquotes.io:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      throw new Error('Invalid JSON from zenquotes.io');
    }

    if (data && data[0]) {
      cachedQuote = data;
      cacheDate = today;
      console.log('Fetched new quote:', data);
      res.json(data);
    } else {
      throw new Error('No quote received');
    }
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.json([
      {
        q: 'Teamwork makes the dream work.',
        a: 'John C. Maxwell',
      },
    ]);
  }
});


//updateEventStatus(); // actualizarea statusului evenimentelor
//cleanOldNotifications(); // ștergerea notificărilor vechi
//backupMongoDBMonthly(); // backup zilnic al bazei de date
//cleanOldBackups(); // ștergerea backup-urilor vechi
module.exports = app; 
