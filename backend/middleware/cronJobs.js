const cron = require('node-cron');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const backupMongoDB = require('../scripts/backupMongoDB');
const path = require('path');
const fs = require('fs').promises;

// Rulează la fiecare oră (la minutul 0)
const updateEventStatus = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Verific statusul evenimentelor...');
      const now = new Date();

      // Găsește toate evenimentele care sunt Scheduled și au finishDate în trecut
      const eventsToUpdate = await Event.find({
        status: 'Scheduled',
        finishDate: { $lt: now },
      });

      if (eventsToUpdate.length === 0) {
        console.log('Nu există evenimente de actualizat.');
        return;
      }

      // Actualizează statusul la Finished
      await Promise.all(
        eventsToUpdate.map(async (event) => {
          event.status = 'Finished';
          await event.save();
        })
      );

      console.log(`${eventsToUpdate.length} evenimente au fost actualizate la statusul Finished.`);
    } catch (error) {
      console.error('Eroare la actualizarea statusului evenimentelor:', error);
    }
  });
};

const cleanOldNotifications = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await Notification.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
      console.log('Notificările mai vechi de 30 de zile au fost șterse.');
    } catch (error) {
      console.error('Eroare la ștergerea notificărilor vechi:', error);
    }
  });
};

const backupMongoDBMonthly = () => {
  cron.schedule('0 0 1 * *', async () => {
    try {
      console.log('Rulez backup-ul lunar al bazei de date...');
      await backupMongoDB();
    } catch (error) {
      console.error('Eroare la backup-ul lunar:', error);
    }
  });
};

// Job pentru ștergerea backup-urilor mai vechi de un an (rulează lunar, pe data de 2 la 00:00)
const cleanOldBackups = () => {
  cron.schedule('0 0 2 * *', async () => {
    try {
      console.log('Verific backup-urile vechi pentru ștergere...');
      const backupDir = path.join(__dirname, '../backups');
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1); // Scade un an

      const backupFolders = await fs.readdir(backupDir);
      for (const folder of backupFolders) {
        if (folder.startsWith('backup-')) {
          const dateStr = folder.replace('backup-', '');
          const folderDate = new Date(dateStr);
          if (folderDate < oneYearAgo) {
            const folderPath = path.join(backupDir, folder);
            await fs.rm(folderPath, { recursive: true, force: true });
            console.log(`Backup vechi șters: ${folderPath}`);
          }
        }
      }
      console.log('Verificarea backup-urilor vechi a fost finalizată.');
    } catch (error) {
      console.error('Eroare la ștergerea backup-urilor vechi:', error);
    }
  });
};
module.exports = { updateEventStatus, cleanOldNotifications, backupMongoDBMonthly, cleanOldBackups };