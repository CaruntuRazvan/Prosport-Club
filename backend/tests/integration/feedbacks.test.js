const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const log = require('../utils/logger');
const app = require('../../app');
const User = require('../../models/User');
const Event = require('../../models/Event');
const Feedback = require('../../models/Feedback');
const Notification = require('../../models/Notification');
const Player = require('../../models/Player');

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

// Mock pentru openaiService
jest.mock('../../middleware/openaiService', () => ({
  generateFeedbackSummary: jest.fn().mockResolvedValue('Mocked summary'),
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
  await Event.deleteMany();
  await Feedback.deleteMany();
  await Notification.deleteMany();
  await Player.deleteMany();
  log.success('Database cleared');
}, 30000);

describe('Feedback Routes Integration Tests', () => {
  describe('POST /api/feedbacks - Add Feedback', () => {
    it('should allow event creator to add feedback for a player', async () => {
      log.test('Running test: should allow event creator to add feedback for a player');
      const creatorId = new mongoose.Types.ObjectId();
      const playerId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');

      // Creează un document Player pentru jucător
      const playerDoc = await Player.create({
        firstName: 'Test',
        lastName: 'Player',
        dateOfBirth: '2000-01-01',
        nationality: 'Romanian',
        height: 180,
        weight: 75,
        position: 'Forward',
        preferredFoot: 'right',
      });

      await User.create([
        {
          _id: creatorId,
          email: 'creator@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Creator',
          role: 'manager',
        },
        {
          _id: playerId,
          email: 'player@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Player',
          role: 'player',
          firstName: 'Test',
          lastName: 'Player',
          playerId: playerDoc._id, // Setăm playerId
        },
      ]);

      const event = await Event.create({
        title: 'Training Session',
        description: 'Team training session',
        startDate: '2025-05-26T10:00:00Z',
        finishDate: '2025-05-26T12:00:00Z',
        players: [playerId],
        staff: [],
        createdBy: creatorId,
        status: 'Scheduled',
      });

      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'manager', _id: creatorId.toString() };
        next();
      });

      const res = await request(app)
        .post('/api/feedbacks')
        .send({
          eventId: event._id.toString(),
          receiverId: playerId.toString(),
          satisfactionLevel: 'good',
          comment: 'Great performance',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Feedback adăugat cu succes');
      expect(res.body.feedback).toMatchObject({
        eventId: event._id.toString(),
        receiverId: playerId.toString(),
        satisfactionLevel: 'good',
        comment: 'Great performance',
      });

      const feedback = await Feedback.findOne({ eventId: event._id, receiverId: playerId });
      expect(feedback).toBeDefined();
      log.separator();
    });

    it('should fail if user is not the event creator', async () => {
      log.test('Running test: should fail if user is not the event creator');
      const creatorId = new mongoose.Types.ObjectId();
      const nonCreatorId = new mongoose.Types.ObjectId();
      const playerId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');

      const playerDoc = await Player.create({
        firstName: 'Test',
        lastName: 'Player',
        dateOfBirth: '2000-01-01',
        nationality: 'Romanian',
        height: 180,
        weight: 75,
        position: 'Forward',
        preferredFoot: 'right',
      });

      await User.create([
        {
          _id: creatorId,
          email: 'creator@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Creator',
          role: 'manager',
        },
        {
          _id: nonCreatorId,
          email: 'noncreator@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Non Creator',
          role: 'manager',
        },
        {
          _id: playerId,
          email: 'player@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Player',
          role: 'player',
          firstName: 'Test',
          lastName: 'Player',
          playerId: playerDoc._id,
        },
      ]);

      const event = await Event.create({
        title: 'Training Session',
        description: 'Team training session',
        startDate: '2025-05-26T10:00:00Z',
        finishDate: '2025-05-26T12:00:00Z',
        players: [playerId],
        staff: [],
        createdBy: creatorId,
        status: 'Scheduled',
      });

      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'manager', _id: nonCreatorId.toString() };
        next();
      });

      const res = await request(app)
        .post('/api/feedbacks')
        .send({
          eventId: event._id.toString(),
          receiverId: playerId.toString(),
          satisfactionLevel: 'good',
          comment: 'Great performance',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error', 'Doar creatorul evenimentului poate adăuga feedback');
      log.separator();
    });

    it('should fail if player is not involved in the event', async () => {
      log.test('Running test: should fail if player is not involved in the event');
      const creatorId = new mongoose.Types.ObjectId();
      const playerId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');

      const playerDoc = await Player.create({
        firstName: 'Test',
        lastName: 'Player',
        dateOfBirth: '2000-01-01',
        nationality: 'Romanian',
        height: 180,
        weight: 75,
        position: 'Forward',
        preferredFoot: 'right',
      });

      await User.create([
        {
          _id: creatorId,
          email: 'creator@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Creator',
          role: 'manager',
        },
        {
          _id: playerId,
          email: 'player@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Player',
          role: 'player',
          firstName: 'Test',
          lastName: 'Player',
          playerId: playerDoc._id,
        },
      ]);

      const event = await Event.create({
        title: 'Training Session',
        description: 'Team training session',
        startDate: '2025-05-26T10:00:00Z',
        finishDate: '2025-05-26T12:00:00Z',
        players: [], // Jucătorul nu este implicat
        staff: [],
        createdBy: creatorId,
        status: 'Scheduled',
      });

      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'manager', _id: creatorId.toString() };
        next();
      });

      const res = await request(app)
        .post('/api/feedbacks')
        .send({
          eventId: event._id.toString(),
          receiverId: playerId.toString(),
          satisfactionLevel: 'good',
          comment: 'Great performance',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Jucătorul nu este implicat în acest eveniment');
      log.separator();
    });
  });

  describe('GET /api/feedbacks/event/:eventId - Get Feedbacks for an Event', () => {
    it('should fail if user is not authorized to get feedbacks', async () => {
      log.test('Running test: should fail if user is not authorized to get feedbacks');
      const creatorId = new mongoose.Types.ObjectId();
      const playerId = new mongoose.Types.ObjectId();
      const unauthorizedUserId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');

      const playerDoc = await Player.create({
        firstName: 'Test',
        lastName: 'Player',
        dateOfBirth: '2000-01-01',
        nationality: 'Romanian',
        height: 180,
        weight: 75,
        position: 'Forward',
        preferredFoot: 'right',
      });

      await User.create([
        {
          _id: creatorId,
          email: 'creator@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Creator',
          role: 'manager',
        },
        {
          _id: playerId,
          email: 'player@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Player',
          role: 'player',
          firstName: 'Test',
          lastName: 'Player',
          playerId: playerDoc._id,
        },
        {
          _id: unauthorizedUserId,
          email: 'unauth@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Unauthorized User',
          role: 'manager', // Non-creator, non-staff
        },
      ]);

      const event = await Event.create({
        title: 'Training Session',
        description: 'Team training session',
        startDate: '2025-05-26T10:00:00Z',
        finishDate: '2025-05-26T12:00:00Z',
        players: [playerId],
        staff: [], // Utilizatorul neautorizat nu este în staff
        createdBy: creatorId,
        status: 'Scheduled',
      });

      await Feedback.create({
        eventId: event._id,
        creatorId,
        receiverId: playerId,
        satisfactionLevel: 'good',
        comment: 'Great performance',
      });

      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'manager', _id: unauthorizedUserId.toString() };
        next();
      });

      const res = await request(app).get(`/api/feedbacks/event/${event._id}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error', 'Doar creatorul evenimentului poate vedea feedback-urile');
      log.separator();
    });
  });

  describe('DELETE /api/events/:id - Delete Event and Associated Feedbacks', () => {
    it('should delete an event and its associated feedbacks', async () => {
      log.test('Running test: should delete an event and its associated feedbacks');
      const creatorId = new mongoose.Types.ObjectId();
      const playerId1 = new mongoose.Types.ObjectId();
      const playerId2 = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');

      const playerDoc1 = await Player.create({
        firstName: 'Test1',
        lastName: 'Player1',
        dateOfBirth: '2000-01-01',
        nationality: 'Romanian',
        height: 180,
        weight: 75,
        position: 'Forward',
        preferredFoot: 'right',
      });

      const playerDoc2 = await Player.create({
        firstName: 'Test2',
        lastName: 'Player2',
        dateOfBirth: '2000-01-01',
        nationality: 'Romanian',
        height: 180,
        weight: 75,
        position: 'Midfielder',
        preferredFoot: 'left',
      });

      await User.create([
        {
          _id: creatorId,
          email: 'creator@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Creator',
          role: 'manager',
        },
        {
          _id: playerId1,
          email: 'player1@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Player 1',
          role: 'player',
          firstName: 'Test1',
          lastName: 'Player1',
          playerId: playerDoc1._id,
        },
        {
          _id: playerId2,
          email: 'player2@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Player 2',
          role: 'player',
          firstName: 'Test2',
          lastName: 'Player2',
          playerId: playerDoc2._id,
        },
      ]);

      const event = await Event.create({
        title: 'Training Session',
        description: 'Team training session',
        startDate: '2025-05-26T10:00:00Z',
        finishDate: '2025-05-26T12:00:00Z',
        players: [playerId1, playerId2],
        staff: [],
        createdBy: creatorId,
        status: 'Scheduled',
      });

      await Feedback.create([
        {
          eventId: event._id,
          creatorId,
          receiverId: playerId1,
          satisfactionLevel: 'good',
          comment: 'Great performance',
        },
        {
          eventId: event._id,
          creatorId,
          receiverId: playerId2,
          satisfactionLevel: 'bad',
          comment: 'Needs improvement',
        },
      ]);

      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'manager', _id: creatorId.toString() };
        next();
      });

      const res = await request(app).delete(`/api/events/${event._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Evenimentul a fost șters cu succes.');

      const feedbacks = await Feedback.find({ eventId: event._id });
      expect(feedbacks).toHaveLength(0);
      const deletedEvent = await Event.findById(event._id);
      expect(deletedEvent).toBeNull();
      log.separator();
    });

    it('should fail if user is not authorized to delete the event', async () => {
      log.test('Running test: should fail if user is not authorized to delete the event');
      const creatorId = new mongoose.Types.ObjectId();
      const playerId = new mongoose.Types.ObjectId();
      const unauthorizedUserId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');

      const playerDoc = await Player.create({
        firstName: 'Test',
        lastName: 'Player',
        dateOfBirth: '2000-01-01',
        nationality: 'Romanian',
        height: 180,
        weight: 75,
        position: 'Forward',
        preferredFoot: 'right',
      });

      await User.create([
        {
          _id: creatorId,
          email: 'creator@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Creator',
          role: 'manager',
        },
        {
          _id: playerId,
          email: 'player@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Player',
          role: 'player',
          firstName: 'Test',
          lastName: 'Player',
          playerId: playerDoc._id,
        },
        {
          _id: unauthorizedUserId,
          email: 'unauth@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Unauthorized User',
          role: 'player',
        },
      ]);

      const event = await Event.create({
        title: 'Training Session',
        description: 'Team training session',
        startDate: '2025-05-26T10:00:00Z',
        finishDate: '2025-05-26T12:00:00Z',
        players: [playerId],
        staff: [],
        createdBy: creatorId,
        status: 'Scheduled',
      });

      await Feedback.create({
        eventId: event._id,
        creatorId,
        receiverId: playerId,
        satisfactionLevel: 'good',
        comment: 'Great performance',
      });

      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'player', _id: unauthorizedUserId.toString() };
        next();
      });

      const res = await request(app).delete(`/api/events/${event._id}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', 'Acces permis doar managerilor și staff-ului.');

      const feedbacks = await Feedback.find({ eventId: event._id });
      expect(feedbacks).toHaveLength(1); // Feedback-ul nu a fost șters
      const existingEvent = await Event.findById(event._id);
      expect(existingEvent).not.toBeNull();
      log.separator();
    });
  });
});