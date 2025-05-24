const { exec } = require('child_process');
const path = require('path');
const util = require('util');

// Transformă exec într-o funcție care suportă promisiuni
const execPromise = util.promisify(exec);

// Funcție pentru backup MongoDB
const backupMongoDB = async () => {
  try {
    // Definim calea unde se va salva backup-ul
    const backupDir = path.join(__dirname, '../backups');
    const date = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const backupPath = path.join(backupDir, `backup-${date}`);

    // Comanda mongodump (presupunem că MongoDB rulează local)
    const command = `mongodump --uri="mongodb://localhost/football-app" --out="${backupPath}"`;

    console.log(`Încep backup-ul bazei de date la ${backupPath}...`);
    const { stdout, stderr } = await execPromise(command);

    if (stderr) {
      console.error('Eroare la mongodump:', stderr);
      return;
    }

    console.log(`Backup realizat cu succes la ${backupPath}`);
    console.log(stdout);
  } catch (error) {
    console.error('Eroare la realizarea backup-ului:', error.message);
  }
};

module.exports = backupMongoDB;