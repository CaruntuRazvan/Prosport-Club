const express = require("express");
const User = require("../models/User");
const Player = require('../models/Player');
const router = express.Router();
const bcrypt = require("bcryptjs");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Manager = require('../models/Manager');
const Staff = require('../models/Staff');
const auth = require('../middleware/auth');
const { isAdmin, isStaff } = require('../middleware/roleMiddleware');
const { body, validationResult } = require('express-validator');
const { loginUser} = require("../controllers/userController");

// POST /api/users/login
router.post(
  '/login',
  [
    // Validare și sanitizare pentru email
    body('email')
      .trim()
      .isEmail()
      .withMessage('Introdu un email valid')
      .normalizeEmail() // Sanitizează email-ul (elimină spațiile, transformă în lowercase)
      .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .withMessage('Email-ul conține caractere nepermise'),

    // Validare și sanitizare pentru parolă
    body('password')
      .trim() // Elimină spațiile de la început și sfârșit
      .notEmpty()
      .withMessage('Parola este obligatorie')
      .isLength({ min: 6 })
      .withMessage('Parola trebuie să aibă cel puțin 6 caractere'),
  ],
  loginUser
);
// Setarea opțiunilor pentru multer

// Funcție pentru a determina folderul în funcție de rol
const getDestination = (role) => {
  switch (role) {
    case 'player':
      return 'uploads/players';
    case 'manager':
      return 'uploads/manager';
    case 'staff':
      return 'uploads/staff';
    default:
      return 'uploads/other'; // Fallback pentru alte roluri
  }
};

// Configurare storage pentru multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const role = req.body.role; // Rolul trimis din formular
    const destination = path.join(__dirname, '..', getDestination(role)); // Cale absolută către folder

    // Verificăm dacă folderul există, dacă nu, îl creăm
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    cb(null, destination); // Setăm folderul de destinație
  },
  filename: (req, file, cb) => {
    const email = req.body.email; // Email-ul trimis din formular
    if (!email) {
      return cb(new Error('Email-ul este obligatoriu pentru numele fișierului!'), null);
    }

    // Înlocuim @ cu _ și păstrăm extensia originală
    const emailPrefix = email.replace('@', '_');
    const fileExtension = file.originalname.split('.').pop(); // Ex. jpg, png
    const filename = `${emailPrefix}.${fileExtension}`; // Ex. johndoe_prosport.jpg
    cb(null, filename); // Setăm numele fișierului
  },
});

const upload = multer({ storage: storage })
// Obține toți utilizatorii
router.get("/", async (req, res) => {
  try {
    const users = await User.find()
      .populate('playerId')
      .populate('managerId')
      .populate('staffId');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Eroare la obținerea utilizatorilor.' });
  }
});
// POST /add - Adaugă un utilizator nou (doar pentru admin)
router.post('/add', upload.single('image'), auth, isAdmin, async (req, res) => {
  const { name, email, password, role, playerDetails, managerDetails, staffDetails } = req.body;

  // Verificare câmpuri obligatorii de bază
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Toate câmpurile de bază sunt obligatorii!' });
  }

  try {
    // Verifică dacă email-ul există deja
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email-ul este deja utilizat!' });
    }

    // Hashing parola
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inițializăm utilizatorul fără detalii asociate
    let newUser = new User({ name, email, password: hashedPassword, role });

    // Setăm calea imaginii în funcție de rol
    let imagePath = req.file ? `/${getDestination(role)}/${req.file.filename}` : null;

    // Gestionăm rolurile specifice
    if (role === 'player') {
      if (!playerDetails) {
        return res.status(400).json({ message: 'Detaliile jucătorului sunt necesare pentru rolul de player!' });
      }

      const parsedPlayerDetails = typeof playerDetails === 'string' ? JSON.parse(playerDetails) : playerDetails;
      const {
        firstName,
        lastName,
        dateOfBirth,
        nationality,
        height,
        weight,
        history,
        position,
        shirtNumber,
        phoneNumber,
        preferredFoot,
        status
      } = parsedPlayerDetails;

      // Verificare câmpuri obligatorii pentru Player
      if (!firstName || !lastName || !dateOfBirth || !nationality || !height || !weight || !position || !preferredFoot) {
        return res.status(400).json({ message: 'Toate câmpurile obligatorii pentru Player sunt necesare!' });
      }

      const newPlayer = new Player({
        firstName,
        lastName,
        dateOfBirth,
        nationality,
        height: Number(height),
        weight: Number(weight),
        history,
        image: imagePath,
        position,
        shirtNumber: shirtNumber ? Number(shirtNumber) : undefined,
        phoneNumber,
        preferredFoot,
        status
      });

      const savedPlayer = await newPlayer.save();
      newUser.playerId = savedPlayer._id;
    } else if (role === 'manager') {
      if (!managerDetails) {
        return res.status(400).json({ message: 'Detaliile managerului sunt necesare pentru rolul de manager!' });
      }

      const parsedManagerDetails = typeof managerDetails === 'string' ? JSON.parse(managerDetails) : managerDetails;
      const { firstName, lastName, dateOfBirth, nationality, history } = parsedManagerDetails;

      // Verificare câmpuri obligatorii pentru Manager
      if (!firstName || !lastName || !dateOfBirth || !nationality) {
        return res.status(400).json({ message: 'Toate câmpurile pentru Manager sunt obligatorii!' });
      }

      const newManager = new Manager({
        firstName,
        lastName,
        dateOfBirth,
        nationality,
        history,
        image: imagePath,
      });

      const savedManager = await newManager.save();
      newUser.managerId = savedManager._id;
    } else if (role === 'staff') {
      if (!staffDetails) {
        return res.status(400).json({ message: 'Detaliile staff-ului sunt necesare pentru rolul de staff!' });
      }

      const parsedStaffDetails = typeof staffDetails === 'string' ? JSON.parse(staffDetails) : staffDetails;
      const { firstName, lastName, dateOfBirth, nationality, role: staffRole, history, certifications } = parsedStaffDetails;

      // Verificare câmpuri obligatorii pentru Staff
      if (!firstName || !lastName || !dateOfBirth || !nationality || !staffRole) {
        return res.status(400).json({ message: 'Toate câmpurile pentru Staff sunt obligatorii!' });
      }

      const newStaff = new Staff({
        firstName,
        lastName,
        dateOfBirth,
        nationality,
        role: staffRole,
        history,
        certifications,
        image: imagePath,
      });

      const savedStaff = await newStaff.save();
      newUser.staffId = savedStaff._id;
    }

    // Salvează utilizatorul cu ID-urile asociate (dacă există)
    newUser = await newUser.save();

    res.status(201).json({ message: 'Utilizator adăugat cu succes!', user: newUser });
  } catch (error) {
    console.error('Eroare la adăugarea utilizatorului:', error);
    res.status(500).json({ message: 'Eroare la adăugarea utilizatorului.', error: error.message });
  }
});
router.put('/:id', upload.single('image'), auth, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, playerDetails, managerDetails, staffDetails } = req.body;

  try {
    // Găsește utilizatorul existent
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit.' });
    }

    // Actualizează câmpurile de bază
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (role && ['player', 'manager', 'staff', 'admin'].includes(role)) user.role = role; // Validare explicită

    // Logăm datele primite pentru depanare
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    // Actualizează detaliile specifice rolului
    if (role === 'player' && playerDetails) {
      let player = await Player.findById(user.playerId);
      if (player) {
        const parsedPlayerDetails = typeof playerDetails === 'string' ? JSON.parse(playerDetails) : playerDetails;
        
        player.firstName = parsedPlayerDetails.firstName || player.firstName;
        player.lastName = parsedPlayerDetails.lastName || player.lastName;
        player.dateOfBirth = parsedPlayerDetails.dateOfBirth || player.dateOfBirth;
        player.nationality = parsedPlayerDetails.nationality || player.nationality;
        player.height = parsedPlayerDetails.height ? Number(parsedPlayerDetails.height) : player.height;
        player.weight = parsedPlayerDetails.weight ? Number(parsedPlayerDetails.weight) : player.weight;
        player.history = parsedPlayerDetails.history || player.history;
        player.position = parsedPlayerDetails.position || player.position;
        player.shirtNumber = parsedPlayerDetails.shirtNumber !== undefined ? Number(parsedPlayerDetails.shirtNumber) : player.shirtNumber;
        player.phoneNumber = parsedPlayerDetails.phoneNumber || player.phoneNumber;
        player.preferredFoot = parsedPlayerDetails.preferredFoot || player.preferredFoot;
        player.status = parsedPlayerDetails.status || player.status;

        if (req.file) {
          const imagePath = `/${getDestination(role)}/${req.file.filename}`;
          player.image = imagePath;
        } else if (parsedPlayerDetails.image && typeof parsedPlayerDetails.image === 'string') {
          player.image = parsedPlayerDetails.image;
        }

        await player.save();
      }
    } else if (role === 'manager' && managerDetails) {
      let manager = await Manager.findById(user.managerId);
      if (manager) {
        const parsedManagerDetails = typeof managerDetails === 'string' ? JSON.parse(managerDetails) : managerDetails;
        
        manager.firstName = parsedManagerDetails.firstName || manager.firstName;
        manager.lastName = parsedManagerDetails.lastName || manager.lastName;
        manager.dateOfBirth = parsedManagerDetails.dateOfBirth || manager.dateOfBirth;
        manager.nationality = parsedManagerDetails.nationality || manager.nationality;
        manager.history = parsedManagerDetails.history || manager.history;

        if (req.file) {
          const imagePath = `/${getDestination(role)}/${req.file.filename}`;
          manager.image = imagePath;
        } else if (parsedManagerDetails.image && typeof parsedManagerDetails.image === 'string') {
          manager.image = parsedManagerDetails.image;
        }

        await manager.save();
      }
    } else if (role === 'staff' && staffDetails) {
      let staff = await Staff.findById(user.staffId);
      if (staff) {
        const parsedStaffDetails = typeof staffDetails === 'string' ? JSON.parse(staffDetails) : staffDetails;
        
        staff.firstName = parsedStaffDetails.firstName || staff.firstName;
        staff.lastName = parsedStaffDetails.lastName || staff.lastName;
        staff.dateOfBirth = parsedStaffDetails.dateOfBirth || staff.dateOfBirth;
        staff.nationality = parsedStaffDetails.nationality || staff.nationality;
        staff.role = parsedStaffDetails.role || staff.role;
        staff.history = parsedStaffDetails.history || staff.history;
        staff.certifications = parsedStaffDetails.certifications || staff.certifications;

        if (req.file) {
          const imagePath = `/${getDestination(role)}/${req.file.filename}`;
          staff.image = imagePath;
        } else if (parsedStaffDetails.image && typeof parsedStaffDetails.image === 'string') {
          staff.image = parsedStaffDetails.image;
        }

        await staff.save();
      }
    }

    // Salvează utilizatorul actualizat
    await user.save();
    res.status(200).json({ message: 'Utilizator actualizat cu succes!', user });
  } catch (error) {
    console.error('Eroare la actualizarea utilizatorului:', error);
    res.status(500).json({ message: 'Eroare la actualizarea utilizatorului.', error: error.message });
  }
});

router.get('/:role/:id', async (req, res) => {
  try {
    const { role, id } = req.params;
    const validRoles = ['admin', 'player', 'manager', 'staff'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    let user;
    if (role === 'admin') {
      // Dacă rolul este admin, căutăm direct în colecția User
      user = await User.findById(id);
    } else {
      // Dacă nu este admin, populăm cu referințele corespunzătoare
      user = await User.findOne({ _id: id }).populate(`${role}Id`);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.delete('/delete', auth, isAdmin, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email-ul este necesar!' });
  }

  try {
    // Căutăm utilizatorul în baza de date și îl ștergem
    const user = await User.findOneAndDelete({ email });

    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit!' });
    }

    // Obținem rolul utilizatorului și determinăm folderul asociat
    const role = user.role || 'other';
    const folderPath = path.join(__dirname, '..', getDestination(role));

    // Construim numele fișierului (email-ul înlocuind '@' cu '_')
    const emailPrefix = email.replace('@', '_');
    const possibleExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    let imageDeleted = false;

    for (const ext of possibleExtensions) {
      const filePath = path.join(folderPath, `${emailPrefix}.${ext}`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Șterge fișierul
        imageDeleted = true;
        break;
      }
    }

    res.status(200).json({
      message: 'Utilizator șters cu succes!',
      imageDeleted: imageDeleted ? 'Imaginea asociată a fost ștearsă.' : 'Nicio imagine găsită pentru acest utilizator.'
    });
  } catch (error) {
    console.error('Eroare la ștergerea utilizatorului:', error);
    res.status(500).json({ message: 'Eroare la ștergerea utilizatorului.' });
  }
});

router.put(
  '/player/:id/update',
  [
    auth,
    isStaff,
    body('weight')
      .isFloat({ min: 0 })
      .withMessage('Greutatea trebuie să fie un număr pozitiv'),
    body('height')
      .isFloat({ min: 0 })
      .withMessage('Înălțimea trebuie să fie un număr pozitiv'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { weight, height } = req.body;

    try {
      // Găsește jucătorul în colecția Player
      const player = await Player.findById(id);
      if (!player) {
        return res.status(404).json({ message: 'Jucătorul nu a fost găsit.' });
      }

      // Actualizează câmpurile specificate
      if (weight !== undefined) player.weight = Number(weight);
      if (height !== undefined) player.height = Number(height);

      // Salvează modificările
      const updatedPlayer = await player.save();

      res.status(200).json({
        message: 'Datele jucătorului au fost actualizate cu succes!',
        player: updatedPlayer,
      });
    } catch (error) {
      console.error('Eroare la actualizarea jucătorului:', error);
      res.status(500).json({ message: 'Eroare la actualizarea jucătorului.', error: error.message });
    }
  }
);
module.exports = router;
