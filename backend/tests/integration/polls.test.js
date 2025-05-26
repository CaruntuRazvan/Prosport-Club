const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const log = require('../utils/logger');
const app = require('../../app');
const User = require('../../models/User');
const Poll = require('../../models/Poll');
const Notification = require('../../models/Notification');

jest.mock('../../middleware/openaiService', () => ({
  generateText: jest.fn().mockResolvedValue('Mocked response from OpenAI'),
}));
// Setează timeout-ul global
jest.setTimeout(30000);

let mongoServer;

// Definim un userId static pentru mock
const mockUserId = new mongoose.Types.ObjectId().toString();

// Mock pentru middleware-ul auth
jest.mock('../../middleware/auth', () => jest.fn((req, res, next) => {
  req.user = { role: 'manager', _id: mockUserId };
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
    },
  });
  const uri = mongoServer.getUri();
  try {
    await mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
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
  await Poll.deleteMany();
  await Notification.deleteMany();
  log.success('Database cleared');
}, 30000);

describe('Poll Routes Integration Tests', () => {
  describe('POST /api/polls - Create a Poll', () => {
    it('should allow a manager to create a poll', async () => {
      log.test('Running test: should allow a manager to create a poll');
      const userId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');
      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'manager', _id: userId.toString() };
        next();
      });

      await User.create({
        _id: userId,
        email: 'manager@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Manager',
        role: 'manager',
      });

      const res = await request(app)
        .post('/api/polls')
        .send({
          question: 'What is your favorite training session?',
          options: ['Morning Run', 'Tactical Training', 'Gym Session'],
          expiresAt: '2025-05-30T12:00:00Z',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Sondaj creat cu succes');
      expect(res.body.poll).toMatchObject({
        question: 'What is your favorite training session?',
        options: [
          { text: 'Morning Run', votes: [] },
          { text: 'Tactical Training', votes: [] },
          { text: 'Gym Session', votes: [] },
        ],
      });

      const poll = await Poll.findOne({ question: 'What is your favorite training session?' });
      expect(poll).toBeDefined();
      log.separator();
    });

    it('should fail if user is not manager or staff', async () => {
      log.test('Running test: should fail if user is not manager or staff');
      const userId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');
      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'player', _id: userId.toString() };
        next();
      });

      await User.create({
        _id: userId,
        email: 'player@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Player',
        role: 'player',
      });

      const res = await request(app)
        .post('/api/polls')
        .send({
          question: 'What is your favorite training session?',
          options: ['Morning Run', 'Tactical Training', 'Gym Session'],
          expiresAt: '2025-05-30T12:00:00Z',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', 'Acces permis doar managerilor și staff-ului.');
      log.separator();
    });

    it('should fail if options are not an array of strings', async () => {
      log.test('Running test: should fail if options are not an array of strings');
      const userId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');
      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'manager', _id: userId.toString() };
        next();
      });

      await User.create({
        _id: userId,
        email: 'manager@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Manager',
        role: 'manager',
      });

      const res = await request(app)
        .post('/api/polls')
        .send({
          question: 'What is your favorite training session?',
          options: ['Morning Run', 123, 'Gym Session'], // Opțiune invalidă (număr)
          expiresAt: '2025-05-30T12:00:00Z',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Opțiunile trebuie să fie un array de string-uri.');
      log.separator();
    });
  });

  describe('POST /api/polls/:id/vote - Vote in a Poll', () => {
    it('should allow a player to vote in a poll', async () => {
      log.test('Running test: should allow a player to vote in a poll');
      const managerId = new mongoose.Types.ObjectId();
      const playerId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');

      // Creează un manager (creatorul sondajului)
      await User.create({
        _id: managerId,
        email: 'manager@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Manager',
        role: 'manager',
      });

      // Creează un jucător (care va vota)
      await User.create({
        _id: playerId,
        email: 'player@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Player',
        role: 'player',
      });

      const poll = await Poll.create({
        question: 'What is your favorite training session?',
        options: [
          { text: 'Morning Run', votes: [] },
          { text: 'Tactical Training', votes: [] },
          { text: 'Gym Session', votes: [] },
        ],
        createdBy: managerId,
        expiresAt: '2025-05-30T12:00:00Z',
      });

      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'player', _id: playerId.toString(), name: 'Test Player' };
        next();
      });

      const res = await request(app)
        .post(`/api/polls/${poll._id}/vote`)
        .send({
          optionIndex: 1,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Vot înregistrat cu succes.');

      const updatedPoll = await Poll.findById(poll._id);
      expect(updatedPoll.options[1].votes).toHaveLength(1);
      expect(updatedPoll.options[1].votes[0].toString()).toBe(playerId.toString());
      log.separator();
    });

    it('should fail if admin tries to vote', async () => {
      log.test('Running test: should fail if admin tries to vote');
      const managerId = new mongoose.Types.ObjectId();
      const adminId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');

      // Creează un manager (creatorul sondajului)
      await User.create({
        _id: managerId,
        email: 'manager@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Manager',
        role: 'manager',
      });

      // Creează un admin (care încearcă să voteze)
      await User.create({
        _id: adminId,
        email: 'admin@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Admin',
        role: 'admin',
      });

      const poll = await Poll.create({
        question: 'What is your favorite training session?',
        options: [
          { text: 'Morning Run', votes: [] },
          { text: 'Tactical Training', votes: [] },
          { text: 'Gym Session', votes: [] },
        ],
        createdBy: managerId,
        expiresAt: '2025-05-30T12:00:00Z',
      });

      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'admin', _id: adminId.toString(), name: 'Test Admin' };
        next();
      });

      const res = await request(app)
        .post(`/api/polls/${poll._id}/vote`)
        .send({
          optionIndex: 1,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error', 'Adminii nu pot vota în sondaje.');
      log.separator();
    });

    it('should fail if user tries to vote twice', async () => {
      log.test('Running test: should fail if user tries to vote twice');
      const managerId = new mongoose.Types.ObjectId();
      const playerId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');

      // Creează un manager (creatorul sondajului)
      await User.create({
        _id: managerId,
        email: 'manager@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Manager',
        role: 'manager',
      });

      // Creează un jucător (care va vota)
      await User.create({
        _id: playerId,
        email: 'player@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Player',
        role: 'player',
      });

      const poll = await Poll.create({
        question: 'What is your favorite training session?',
        options: [
          { text: 'Morning Run', votes: [] },
          { text: 'Tactical Training', votes: [playerId] },
          { text: 'Gym Session', votes: [] },
        ],
        createdBy: managerId,
        expiresAt: '2025-05-30T12:00:00Z',
      });

      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'player', _id: playerId.toString(), name: 'Test Player' };
        next();
      });

      const res = await request(app)
        .post(`/api/polls/${poll._id}/vote`)
        .send({
          optionIndex: 1,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error', 'Ai votat deja în acest sondaj.');
      log.separator();
    });

    it('should fail if optionIndex is invalid', async () => {
      log.test('Running test: should fail if optionIndex is invalid');
      const managerId = new mongoose.Types.ObjectId();
      const playerId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');

      // Creează un manager (creatorul sondajului)
      await User.create({
        _id: managerId,
        email: 'manager@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Manager',
        role: 'manager',
      });

      // Creează un jucător (care va vota)
      await User.create({
        _id: playerId,
        email: 'player@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Player',
        role: 'player',
      });

      const poll = await Poll.create({
        question: 'What is your favorite training session?',
        options: [
          { text: 'Morning Run', votes: [] },
          { text: 'Tactical Training', votes: [] },
          { text: 'Gym Session', votes: [] },
        ],
        createdBy: managerId,
        expiresAt: '2025-05-30T12:00:00Z',
      });

      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'player', _id: playerId.toString(), name: 'Test Player' };
        next();
      });

      const res = await request(app)
        .post(`/api/polls/${poll._id}/vote`)
        .send({
          optionIndex: 5, // Opțiune inexistentă
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Opțiune invalidă.');
      log.separator();
    });
  });
});