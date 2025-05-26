const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const log = require('../utils/logger');
const app = require('../../app');
const User = require('../../models/User');
const Player = require('../../models/Player');
const Staff = require('../../models/Staff');
const Event = require('../../models/Event');
jest.mock('../../middleware/openaiService', () => ({
  generateText: jest.fn().mockResolvedValue('Mocked response from OpenAI'),
}));
// Setează timeout-ul global
jest.setTimeout(30000);

let mongoServer;

const mockUserId = new mongoose.Types.ObjectId().toString();

// Mock pentru middleware-ul auth
jest.mock('../../middleware/auth', () => jest.fn((req, res, next) => {
  req.user = { role: 'manager', _id: mockUserId }; // Folosim mockUserId
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
  await Staff.deleteMany();
  await Event.deleteMany();
  log.success('Database cleared');
}, 30000);

describe('Event Routes for Manager and Staff', () => {
  describe('POST /api/events', () => {
    it('should create an event as a manager', async () => {
      log.test('Running test: should create an event as a manager');
      const userId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');
      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'manager', _id: userId.toString() };
        next();
      });

      // Creează un utilizator manager
      await User.create({
        _id: userId,
        email: 'manager@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Manager',
        role: 'manager',
        playerId: null,
        managerId: null,
        staffId: null,
      });

      const res = await request(app)
        .post('/api/events')
        .send({
          title: 'Training Session',
          description: 'Team training session',
          startDate: '2025-05-26T10:00:00Z',
          finishDate: '2025-05-26T12:00:00Z',
          players: [],
          staff: [],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        title: 'Training Session',
        description: 'Team training session',
        status: 'Scheduled',
      });

      const event = await Event.findOne({ title: 'Training Session' });
      expect(event).toBeDefined();
      log.separator();
    });

    it('should create an event as a staff', async () => {
      log.test('Running test: should create an event as a staff');
      const userId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');
      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'staff', _id: userId.toString() };
        next();
      });

      // Creează un utilizator staff
      const staff = await Staff.create({
        firstName: 'Test',
        lastName: 'Staff',
        dateOfBirth: '1985-01-01',
        nationality: 'Romanian',
        role: 'Assistant Coach',
        history: [],
        certifications: [],
      });

      await User.create({
        _id: userId,
        email: 'staff@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Staff',
        role: 'staff',
        playerId: null,
        managerId: null,
        staffId: staff._id,
      });

      const res = await request(app)
        .post('/api/events')
        .send({
          title: 'Fitness Workshop',
          description: 'Fitness training for players',
          startDate: '2025-05-26T14:00:00Z',
          finishDate: '2025-05-26T16:00:00Z',
          players: [],
          staff: [],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        title: 'Fitness Workshop',
        description: 'Fitness training for players',
        status: 'Scheduled',
      });

      const event = await Event.findOne({ title: 'Fitness Workshop' });
      expect(event).toBeDefined();
      log.separator();
    });

    it('should fail if user is not manager or staff', async () => {
      log.test('Running test: should fail if user is not manager or staff');
      const authMock = jest.requireMock('../../middleware/auth');
      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'player', _id: new mongoose.Types.ObjectId().toString() };
        next();
      });

      const res = await request(app)
        .post('/api/events')
        .send({
          title: 'Training Session',
          description: 'Team training session',
          startDate: '2025-05-26T10:00:00Z',
          finishDate: '2025-05-26T12:00:00Z',
          players: [],
          staff: [],
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', 'Acces permis doar managerilor și staff-ului.');
      log.separator();
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should delete an event as creator (manager)', async () => {
      log.test('Running test: should delete an event as creator (manager)');
      const userId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');
      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'manager', _id: userId.toString() };
        next();
      });

      // Creează un utilizator manager
      await User.create({
        _id: userId,
        email: 'manager@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Manager',
        role: 'manager',
        playerId: null,
        managerId: null,
        staffId: null,
      });

      const event = await Event.create({
        title: 'Training Session',
        description: 'Team training session',
        startDate: '2025-05-26T10:00:00Z',
        finishDate: '2025-05-26T12:00:00Z',
        players: [],
        staff: [],
        createdBy: userId,
        status: 'Scheduled',
      });

      const res = await request(app).delete(`/api/events/${event._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Evenimentul a fost șters cu succes.');

      const deletedEvent = await Event.findById(event._id);
      expect(deletedEvent).toBeNull();
      log.separator();
    });

    it('should delete an event as creator (staff member)', async () => {
      log.test('Running test: should delete an event as staff member');
      const staffUserId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');
      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'staff', _id: staffUserId.toString() };
        next();
      });
    
      // Creează un utilizator staff (care va fi creatorul evenimentului)
      const staff = await Staff.create({
        firstName: 'Test',
        lastName: 'Staff',
        dateOfBirth: '1985-01-01',
        nationality: 'Romanian',
        role: 'Assistant Coach',
        history: [],
        certifications: [],
      });
    
      await User.create({
        _id: staffUserId,
        email: 'staff@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Staff',
        role: 'staff',
        playerId: null,
        managerId: null,
        staffId: staff._id,
      });
    
      const event = await Event.create({
        title: 'Fitness Workshop',
        description: 'Fitness training for players',
        startDate: '2025-05-26T14:00:00Z',
        finishDate: '2025-05-26T16:00:00Z',
        players: [],
        staff: [],
        createdBy: staffUserId, // Staff-ul este creatorul
        status: 'Scheduled',
      });
    
      const res = await request(app).delete(`/api/events/${event._id}`);
    
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Evenimentul a fost șters cu succes.');
    
      const deletedEvent = await Event.findById(event._id);
      expect(deletedEvent).toBeNull();
      log.separator();
    });

    it('should fail if event is not found', async () => {
      log.test('Running test: should fail if event is not found');
      const res = await request(app).delete(`/api/events/${new mongoose.Types.ObjectId()}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Evenimentul nu a fost găsit.');
      log.separator();
    });

    it('should fail if user is not manager or staff', async () => {
      log.test('Running test: should fail if user is not manager or staff');
      const authMock = jest.requireMock('../../middleware/auth');
      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'player', _id: new mongoose.Types.ObjectId().toString() };
        next();
      });

      const userId = new mongoose.Types.ObjectId();
      await User.create({
        _id: userId,
        email: 'creator@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Creator User',
        role: 'manager',
        playerId: null,
        managerId: null,
        staffId: null,
      });

      const event = await Event.create({
        title: 'Training Session',
        description: 'Team training session',
        startDate: '2025-05-26T10:00:00Z',
        finishDate: '2025-05-26T12:00:00Z',
        players: [],
        staff: [],
        createdBy: userId,
        status: 'Scheduled',
      });

      const res = await request(app).delete(`/api/events/${event._id}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', 'Acces permis doar managerilor și staff-ului.');
      log.separator();
    });

    it('should fail if user is not creator or staff of the event', async () => {
      log.test('Running test: should fail if user is not creator or staff of the event');
      const userId = new mongoose.Types.ObjectId();
      const otherUserId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');
      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'manager', _id: userId.toString() };
        next();
      });

      // Creează un utilizator creator
      await User.create({
        _id: otherUserId,
        email: 'creator@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Creator User',
        role: 'manager',
        playerId: null,
        managerId: null,
        staffId: null,
      });

      // Creează un utilizator care încearcă să șteargă
      await User.create({
        _id: userId,
        email: 'other@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Other User',
        role: 'manager',
        playerId: null,
        managerId: null,
        staffId: null,
      });

      const event = await Event.create({
        title: 'Training Session',
        description: 'Team training session',
        startDate: '2025-05-26T10:00:00Z',
        finishDate: '2025-05-26T12:00:00Z',
        players: [],
        staff: [],
        createdBy: otherUserId,
        status: 'Scheduled',
      });

      const res = await request(app).delete(`/api/events/${event._id}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', 'Nu ai permisiunea de a edita sau șterge acest eveniment.');
      log.separator();
    });
  });
});