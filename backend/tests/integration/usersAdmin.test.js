const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const log = require('../utils/logger');
const app = require('../../app');
const User = require('../../models/User');
const Player = require('../../models/Player');
const Manager = require('../../models/Manager');
const Staff = require('../../models/Staff');

jest.mock('../../middleware/openaiService', () => ({
  generateText: jest.fn().mockResolvedValue('Mocked response from OpenAI'),
}));
// Setează timeout-ul global
jest.setTimeout(30000);

let mongoServer;

// Mock pentru middleware-ul auth
jest.mock('../../middleware/auth', () => jest.fn((req, res, next) => {
  req.user = { role: 'admin' }; // Comportament implicit: utilizator admin
  next();
}));


beforeAll(async () => {
  log.info('Starting MongoMemoryServer and connecting to MongoDB...');
  mongoServer = await MongoMemoryServer.create({
    instance: {
      dbName: 'testdb',
    },
    binary: {
      version: '4.4.6',
      downloadDir: process.env.MONGOMS_DOWNLOAD_DIR || './mongodb-binaries',
      skipMD5: true,
    },
  });
  const uri = mongoServer.getUri();
  try {
    await mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      dbName: 'testdb',
    });
    log.success('MongoDB connected');
  } catch (error) {
    log.error(`Failed to connect to MongoDB: ${error.message}`);
    throw error;
  }

  process.env.JWT_SECRET = 'test-secret';
}, 30000);

afterAll(async () => {
  log.info('Disconnecting from MongoDB and stopping MongoMemoryServer...');
  await mongoose.disconnect();
  await mongoServer.stop();
  log.success('MongoDB disconnected and MongoMemoryServer stopped');
}, 30000);

beforeEach(async () => {
  log.info('Starting beforeEach...');
  await User.deleteMany();
  await Player.deleteMany();
  await Manager.deleteMany();
  await Staff.deleteMany();
  log.success('Database cleared');
}, 30000);

describe('Admin User Routes', () => {
  describe('POST /api/users/add', () => {
    it('should add a user with role player', async () => {
      log.test('Running test: should add a user with role player');
      const res = await request(app)
        .post('/api/users/add')
        .send({
          name: 'Test Player',
          email: 'player@example.com',
          password: 'password123',
          role: 'player',
          playerDetails: {
            firstName: 'Test',
            lastName: 'Player',
            dateOfBirth: '1990-01-01',
            nationality: 'Romanian',
            height: 180,
            weight: 75,
            position: 'Forward',
            preferredFoot: 'right',
            history: [],
          },
        });

      expect(res.statusCode).toBe(201, `Failed with response: ${JSON.stringify(res.body)}`);
      expect(res.body).toHaveProperty('message', 'Utilizator adăugat cu succes!');
      expect(res.body.user).toMatchObject({
        email: 'player@example.com',
        role: 'player',
      });

      const user = await User.findOne({ email: 'player@example.com' });
      expect(user.playerId).toBeDefined();
      log.separator();
    });

    it('should add a user with role manager', async () => {
      log.test('Running test: should add a user with role manager');
      const res = await request(app)
        .post('/api/users/add')
        .send({
          name: 'Test Manager',
          email: 'manager@example.com',
          password: 'password123',
          role: 'manager',
          managerDetails: {
            firstName: 'Test',
            lastName: 'Manager',
            dateOfBirth: '1980-01-01',
            nationality: 'Romanian',
            history: [],
          },
        });

      expect(res.statusCode).toBe(201, `Failed with response: ${JSON.stringify(res.body)}`);
      expect(res.body).toHaveProperty('message', 'Utilizator adăugat cu succes!');
      expect(res.body.user).toMatchObject({
        email: 'manager@example.com',
        role: 'manager',
      });

      const user = await User.findOne({ email: 'manager@example.com' });
      expect(user.managerId).toBeDefined();
      log.separator();
    });

    it('should add a user with role staff', async () => {
      log.test('Running test: should add a user with role staff');
      const res = await request(app)
        .post('/api/users/add')
        .send({
          name: 'Test Staff',
          email: 'staff@example.com',
          password: 'password123',
          role: 'staff',
          staffDetails: {
            firstName: 'Test',
            lastName: 'Staff',
            dateOfBirth: '1985-01-01',
            nationality: 'Romanian',
            role: 'Assistant Coach',
            history: [],
            certifications: [],
          },
        });

      expect(res.statusCode).toBe(201, `Failed with response: ${JSON.stringify(res.body)}`);
      expect(res.body).toHaveProperty('message', 'Utilizator adăugat cu succes!');
      expect(res.body.user).toMatchObject({
        email: 'staff@example.com',
        role: 'staff',
      });

      const user = await User.findOne({ email: 'staff@example.com' });
      expect(user.staffId).toBeDefined();
      log.separator();
    });

    it('should fail if required fields are missing', async () => {
      log.test('Running test: should fail if required fields are missing');
      const res = await request(app)
        .post('/api/users/add')
        .send({
          email: 'missing@example.com',
          password: 'password123',
          role: 'player',
          // Lipsesc name și playerDetails
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Toate câmpurile de bază sunt obligatorii!');
      log.separator();
    });

    it('should fail if email is already used', async () => {
      log.test('Running test: should fail if email is already used');
      const password = await bcrypt.hash('password123', 10);
      await User.create({
        email: 'duplicate@example.com',
        password,
        name: 'Duplicate User',
        role: 'player',
        playerId: null,
        managerId: null,
        staffId: null,
        _id: new mongoose.Types.ObjectId(),
      });

      const res = await request(app)
        .post('/api/users/add')
        .send({
          name: 'Duplicate User',
          email: 'duplicate@example.com',
          password: 'password123',
          role: 'player',
          playerDetails: {
            firstName: 'Duplicate',
            lastName: 'User',
            dateOfBirth: '1990-01-01',
            nationality: 'Romanian',
            height: 180,
            weight: 75,
            position: 'Forward',
            preferredFoot: 'right',
            history: [],
          },
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Email-ul este deja utilizat!');
      log.separator();
    });

    it('should fail if not admin', async () => {
      // Modificăm comportamentul mock-ului pentru auth
      const authMock = jest.requireMock('../../middleware/auth');
      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'player' }; // Simulăm un utilizator non-admin
        next();
      });

      log.test('Running test: should fail if not admin');
      const res = await request(app)
        .post('/api/users/add')
        .send({
          name: 'Test Player',
          email: 'player@example.com',
          password: 'password123',
          role: 'player',
          playerDetails: {
            firstName: 'Test',
            lastName: 'Player',
            dateOfBirth: '1990-01-01',
            nationality: 'Romanian',
            height: 180,
            weight: 75,
            position: 'Forward',
            preferredFoot: 'right',
            history: [],
          },
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', 'Acces permis doar administratorilor.');
      log.separator();
    });

    it('should fail if player details are missing', async () => {
      // Resetăm mock-ul pentru a simula din nou un admin
      const authMock = jest.requireMock('../../middleware/auth');
      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'admin' };
        next();
      });

      log.test('Running test: should fail if player details are missing');
      const res = await request(app)
        .post('/api/users/add')
        .send({
          name: 'Test Player',
          email: 'player@example.com',
          password: 'password123',
          role: 'player',
          // Lipsesc playerDetails
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Detaliile jucătorului sunt necesare pentru rolul de player!');
      log.separator();
    });
  });

  describe('DELETE /api/users/delete', () => {
    it('should delete an existing user', async () => {
      log.test('Running test: should delete an existing user');
      const password = await bcrypt.hash('password123', 10);
      await User.create({
        email: 'user@example.com',
        password,
        name: 'Test User',
        role: 'player',
        playerId: null,
        managerId: null,
        staffId: null,
        _id: new mongoose.Types.ObjectId(),
      });

      const res = await request(app)
        .delete('/api/users/delete')
        .send({
          email: 'user@example.com',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Utilizator șters cu succes!');
      expect(res.body).toHaveProperty('imageDeleted', 'Nicio imagine găsită pentru acest utilizator.');

      const user = await User.findOne({ email: 'user@example.com' });
      expect(user).toBeNull();
      log.separator();
    });

    it('should fail if email is missing', async () => {
      log.test('Running test: should fail if email is missing');
      const res = await request(app)
        .delete('/api/users/delete')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Email-ul este necesar!');
      log.separator();
    });

    it('should fail if user is not found', async () => {
      log.test('Running test: should fail if user is not found');
      const res = await request(app)
        .delete('/api/users/delete')
        .send({
          email: 'nonexistent@example.com',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Utilizatorul nu a fost găsit!');
      log.separator();
    });

    it('should fail if not admin', async () => {
      // Modificăm comportamentul mock-ului pentru auth
      const authMock = jest.requireMock('../../middleware/auth');
      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'player' }; // Simulăm un utilizator non-admin
        next();
      });

      log.test('Running test: should fail if not admin');
      const password = await bcrypt.hash('password123', 10);
      await User.create({
        email: 'user@example.com',
        password,
        name: 'Test User',
        role: 'player',
        playerId: null,
        managerId: null,
        staffId: null,
        _id: new mongoose.Types.ObjectId(),
      });

      const res = await request(app)
        .delete('/api/users/delete')
        .send({
          email: 'user@example.com',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', 'Acces permis doar administratorilor.');
      log.separator();
    });
  });

  describe('GET /api/users/', () => {
    it('should return a list of users with populated details', async () => {
      log.test('Running test: should return a list of users with populated details');
      const password = await bcrypt.hash('password123', 10);

      // Creează un utilizator cu rol player și detalii populate
      const player = await Player.create({
        firstName: 'Test',
        lastName: 'Player',
        dateOfBirth: '1990-01-01',
        nationality: 'Romanian',
        height: 180,
        weight: 75,
        position: 'Forward',
        preferredFoot: 'right',
        history: [],
      });
      await User.create({
        email: 'player@example.com',
        password,
        name: 'Test Player',
        role: 'player',
        playerId: player._id,
        managerId: null,
        staffId: null,
        _id: new mongoose.Types.ObjectId(),
      });

      // Creează un utilizator cu rol manager și detalii populate
      const manager = await Manager.create({
        firstName: 'Test',
        lastName: 'Manager',
        dateOfBirth: '1980-01-01',
        nationality: 'Romanian',
        history: [],
      });
      await User.create({
        email: 'manager@example.com',
        password,
        name: 'Test Manager',
        role: 'manager',
        playerId: null,
        managerId: manager._id,
        staffId: null,
        _id: new mongoose.Types.ObjectId(),
      });

      const res = await request(app).get('/api/users/');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toMatchObject({
        email: 'player@example.com',
        role: 'player',
        playerId: { firstName: 'Test', lastName: 'Player' },
      });
      expect(res.body[1]).toMatchObject({
        email: 'manager@example.com',
        role: 'manager',
        managerId: { firstName: 'Test', lastName: 'Manager' },
      });
      log.separator();
    });

    it('should return an empty list if no users exist', async () => {
      log.test('Running test: should return an empty list if no users exist');
      const res = await request(app).get('/api/users/');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(0);
      log.separator();
    });
  });
});