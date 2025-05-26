const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const log = require('../utils/logger');
const Event = require('../../models/Event');
const Notification = require('../../models/Notification');
const User = require('../../models/User'); 
const bcrypt = require('bcryptjs');
const { updateEventStatus } = require('../../middleware/cronJobs'); 

jest.mock('../../middleware/openaiService', () => ({
  generateText: jest.fn().mockResolvedValue('Mocked response from OpenAI'),
}));

jest.mock('node-cron', () => ({
  schedule: jest.fn((schedule, callback) => {
    // Simulăm apelul callback-ului imediat
    callback();
  }),
}));

jest.setTimeout(30000);

let mongoServer;

beforeAll(async () => {
  log.info('Starting MongoMemoryServer and connecting to MongoDB...');
  mongoServer = await MongoMemoryServer.create({
    instance: {
      dbName: 'testdb',
    },
    binary: {
      version: '5.0.15',
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
}, 30000);

afterAll(async () => {
  log.info('Disconnecting from MongoDB and stopping MongoMemoryServer...');
  await mongoose.disconnect();
  await mongoServer.stop();
  log.success('MongoDB disconnected and MongoMemoryServer stopped');
}, 30000);

beforeEach(async () => {
  log.info('Starting beforeEach...');
  await Event.deleteMany();
  await Notification.deleteMany();
  await User.deleteMany();
  log.success('Database cleared');
}, 30000);

describe('Cron Jobs Integration Tests', () => {
  describe('updateEventStatus - Update Event Status to Finished', () => {
    it('should update events with past finishDate to Finished', async () => {
      log.test('Running test: should update events with past finishDate to Finished');
      
      // Creează un utilizator cu rolul 'manager' pentru createdBy
      const creatorId = new mongoose.Types.ObjectId();
      await User.create({
        _id: creatorId,
        email: 'creator@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Creator',
        role: 'manager',
        playerId: null,
        managerId: null,
        staffId: null,
      });

      // Creează un eveniment cu finishDate în trecut
      await Event.create({
        title: 'Past Event',
        description: 'Event with past finish date',
        startDate: '2025-05-25T10:00:00Z',
        finishDate: '2025-05-25T12:00:00Z', // În trecut față de data curentă (2025-05-26)
        players: [],
        staff: [],
        createdBy: creatorId,
        status: 'Scheduled',
      });

      // Rulează job-ul
      await new Promise((resolve) => {
        updateEventStatus();
        setTimeout(resolve, 100); // Așteptăm să se execute job-ul
      });

      const updatedEvent = await Event.findOne({ title: 'Past Event' });
      expect(updatedEvent.status).toBe('Finished');
      log.separator();
    });

    it('should not update events with future finishDate', async () => {
      log.test('Running test: should not update events with future finishDate');
      
      // Creează un utilizator cu rolul 'manager' pentru createdBy
      const creatorId = new mongoose.Types.ObjectId();
      await User.create({
        _id: creatorId,
        email: 'creator@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Creator',
        role: 'manager',
        playerId: null,
        managerId: null,
        staffId: null,
      });

      // Creează un eveniment cu finishDate în viitor
      await Event.create({
        title: 'Future Event',
        description: 'Event with future finish date',
        startDate: '2025-05-27T10:00:00Z',
        finishDate: '2025-05-27T12:00:00Z', // În viitor față de data curentă (2025-05-26)
        players: [],
        staff: [],
        createdBy: creatorId,
        status: 'Scheduled',
      });

      // Rulează job-ul
      await new Promise((resolve) => {
        updateEventStatus();
        setTimeout(resolve, 100);
      });

      const futureEvent = await Event.findOne({ title: 'Future Event' });
      expect(futureEvent.status).toBe('Scheduled');
      log.separator();
    });

    it('should handle errors during event status update', async () => {
      log.test('Running test: should handle errors during event status update');
      
      // Simulăm o eroare prin deconectarea de la MongoDB
      await mongoose.disconnect();

      // Rulează job-ul
      await new Promise((resolve) => {
        updateEventStatus();
        setTimeout(resolve, 100);
      });

      // Reconectăm pentru testele ulterioare
      await mongoose.connect(mongoServer.getUri(), {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
        dbName: 'testdb',
      });
      log.separator();
    });
  });
});