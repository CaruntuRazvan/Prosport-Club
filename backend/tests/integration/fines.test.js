const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const log = require('../utils/logger');
const app = require('../../app');
const User = require('../../models/User');
const Fine = require('../../models/Fine');
const Notification = require('../../models/Notification');

jest.mock('../../middleware/openaiService', () => ({
  generateText: jest.fn().mockResolvedValue('Mocked response from OpenAI'),
}));

// Set global timeout
jest.setTimeout(30000);

let mongoServer;

// Define a static userId for mock
const mockUserId = new mongoose.Types.ObjectId().toString();

// Mock for auth middleware
jest.mock('../../middleware/auth', () => jest.fn((req, res, next) => {
  req.user = { role: 'manager', _id: mockUserId };
  next();
}));

beforeAll(async () => {
  log.info('Starting MongoMemoryServer and connecting to MongoDB...');
  
  try {
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
  
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    if (mongoServer) {
      await mongoServer.stop();
      log.success('MongoMemoryServer stopped');
    }
    
    log.success('MongoDB disconnected');
  } catch (error) {
    log.error(`Cleanup error: ${error.message}`);
  }
}, 30000);

beforeEach(async () => {
  log.info('Starting beforeEach...');
  
  try {
    await Promise.all([
      User.deleteMany({}),
      Fine.deleteMany({}),
      Notification.deleteMany({})
    ]);
    log.success('Database cleared');
  } catch (error) {
    log.error(`BeforeEach error: ${error.message}`);
    throw error;
  }
}, 30000);

describe('Fine Routes Integration Tests', () => {
  describe('POST /api/fines - Create a Fine', () => {
    it('should allow a manager to create a fine', async () => {
      log.test('Running test: should allow a manager to create a fine');
      const managerId = new mongoose.Types.ObjectId();
      const playerId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');

      await User.create([
        {
          _id: managerId,
          email: 'manager@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Manager',
          role: 'manager',
        },
        {
          _id: playerId,
          email: 'player@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Player',
          role: 'player',
        },
      ]);

      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'manager', _id: managerId.toString() };
        next();
      });

      const res = await request(app)
        .post('/api/fines')
        .send({
          receiverId: playerId.toString(),
          reason: 'Late to training',
          amount: 50,
          expirationDate: '2025-06-01T12:00:00Z',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        reason: 'Late to training',
        amount: 50,
        receiverId: playerId.toString(),
        creatorId: managerId.toString(),
      });

      const fine = await Fine.findOne({ reason: 'Late to training' });
      expect(fine).toBeDefined();
      log.separator();
    });

    it('should fail if user is not manager or staff', async () => {
      log.test('Running test: should fail if user is not manager or staff');
      const playerId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');

      await User.create({
        _id: playerId,
        email: 'player@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Player',
        role: 'player',
      });

      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'player', _id: playerId.toString() };
        next();
      });

      const res = await request(app)
        .post('/api/fines')
        .send({
          receiverId: playerId.toString(),
          reason: 'Late to training',
          amount: 50,
          expirationDate: '2025-06-01T12:00:00Z',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', 'Acces permis doar managerilor și staff-ului.');
      log.separator();
    });

    it('should fail if amount is not positive', async () => {
      log.test('Running test: should fail if amount is not positive');
      const managerId = new mongoose.Types.ObjectId();
      const playerId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');

      await User.create([
        {
          _id: managerId,
          email: 'manager@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Manager',
          role: 'manager',
        },
        {
          _id: playerId,
          email: 'player@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Player',
          role: 'player',
        },
      ]);

      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'manager', _id: managerId.toString() };
        next();
      });

      const res = await request(app)
        .post('/api/fines')
        .send({
          receiverId: playerId.toString(),
          reason: 'Late to training',
          amount: -50, // Invalid amount
          expirationDate: '2025-06-01T12:00:00Z',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Amount must be positive');
      log.separator();
    });
  });

  describe('PUT /api/fines/:id/request-payment - Request Payment Confirmation', () => {
    it('should allow a player to request payment confirmation', async () => {
      log.test('Running test: should allow a player to request payment confirmation');
      const managerId = new mongoose.Types.ObjectId();
      const playerId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');

      await User.create([
        {
          _id: managerId,
          email: 'manager@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Manager',
          role: 'manager',
        },
        {
          _id: playerId,
          email: 'player@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Player',
          role: 'player',
        },
      ]);

      const fine = await Fine.create({
        creatorId: managerId,
        receiverId: playerId,
        reason: 'Late to training',
        amount: 50,
        expirationDate: '2025-06-01T12:00:00Z',
        isPaid: false,
        paymentRequested: false,
      });

      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'player', _id: playerId.toString() };
        next();
      });

      const res = await request(app)
        .put(`/api/fines/${fine._id}/request-payment`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Solicitare de plată trimisă cu succes.');
      expect(res.body.fine).toMatchObject({
        paymentRequested: true,
      });

      const updatedFine = await Fine.findById(fine._id);
      expect(updatedFine.paymentRequested).toBe(true);
      log.separator();
    });

    it('should fail if user is not authorized to request payment', async () => {
      log.test('Running test: should fail if user is not authorized to request payment');
      const managerId = new mongoose.Types.ObjectId();
      const playerId = new mongoose.Types.ObjectId();
      const unauthorizedUserId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');

      await User.create([
        {
          _id: managerId,
          email: 'manager@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Manager',
          role: 'manager',
        },
        {
          _id: playerId,
          email: 'player@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Player',
          role: 'player',
        },
        {
          _id: unauthorizedUserId,
          email: 'other@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Other User',
          role: 'player',
        },
      ]);

      const fine = await Fine.create({
        creatorId: managerId,
        receiverId: playerId,
        reason: 'Late to training',
        amount: 50,
        expirationDate: '2025-06-01T12:00:00Z',
        isPaid: false,
        paymentRequested: false,
      });

      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'player', _id: unauthorizedUserId.toString() };
        next();
      });

      const res = await request(app)
        .put(`/api/fines/${fine._id}/request-payment`)
        .send();

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', 'Nu ai permisiunea de a accesa această penalizare.');
      log.separator();
    });

    it('should fail if fine is already paid', async () => {
      log.test('Running test: should fail if fine is already paid');
      const managerId = new mongoose.Types.ObjectId();
      const playerId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');

      await User.create([
        {
          _id: managerId,
          email: 'manager@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Manager',
          role: 'manager',
        },
        {
          _id: playerId,
          email: 'player@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Player',
          role: 'player',
        },
      ]);

      const fine = await Fine.create({
        creatorId: managerId,
        receiverId: playerId,
        reason: 'Late to training',
        amount: 50,
        expirationDate: '2025-06-01T12:00:00Z',
        isPaid: true,
        paymentRequested: true,
      });

      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'player', _id: playerId.toString() };
        next();
      });

      const res = await request(app)
        .put(`/api/fines/${fine._id}/request-payment`)
        .send();

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Amenda este deja marcată ca plătită.');
      log.separator();
    });
  });

  describe('PUT /api/fines/:id - Update Payment Status', () => {
    it('should allow creator to update payment status', async () => {
      log.test('Running test: should allow creator to update payment status');
      const managerId = new mongoose.Types.ObjectId();
      const playerId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');

      await User.create([
        {
          _id: managerId,
          email: 'manager@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Manager',
          role: 'manager',
        },
        {
          _id: playerId,
          email: 'player@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Player',
          role: 'player',
        },
      ]);

      const fine = await Fine.create({
        creatorId: managerId,
        receiverId: playerId,
        reason: 'Late to training',
        amount: 50,
        expirationDate: '2025-06-01T12:00:00Z',
        isPaid: false,
        paymentRequested: true,
      });

      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'manager', _id: managerId.toString() };
        next();
      });

      const res = await request(app)
        .put(`/api/fines/${fine._id}`)
        .send({
          isPaid: true,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        isPaid: true,
        paymentRequested: true,
      });

      const updatedFine = await Fine.findById(fine._id);
      expect(updatedFine.isPaid).toBe(true);
      log.separator();
    });

    it('should fail if user is not the creator', async () => {
      log.test('Running test: should fail if user is not the creator');
      const managerId = new mongoose.Types.ObjectId();
      const playerId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');

      await User.create([
        {
          _id: managerId,
          email: 'manager@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Manager',
          role: 'manager',
        },
        {
          _id: playerId,
          email: 'player@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Player',
          role: 'player',
        },
      ]);

      const fine = await Fine.create({
        creatorId: managerId,
        receiverId: playerId,
        reason: 'Late to training',
        amount: 50,
        expirationDate: '2025-06-01T12:00:00Z',
        isPaid: false,
        paymentRequested: true,
      });

      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'player', _id: playerId.toString() };
        next();
      });

      const res = await request(app)
        .put(`/api/fines/${fine._id}`)
        .send({
          isPaid: true,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', 'Doar creatorul amenzii poate confirma plata.');
      log.separator();
    });
  });

  describe('DELETE /api/fines/:id - Delete a Fine', () => {
    it('should allow creator to delete a fine', async () => {
      log.test('Running test: should allow creator to delete a fine');
      const managerId = new mongoose.Types.ObjectId();
      const playerId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');

      await User.create([
        {
          _id: managerId,
          email: 'manager@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Manager',
          role: 'manager',
        },
        {
          _id: playerId,
          email: 'player@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test Player',
          role: 'player',
        },
      ]);

      const fine = await Fine.create({
        creatorId: managerId,
        receiverId: playerId,
        reason: 'Late to training',
        amount: 50,
        expirationDate: '2025-06-01T12:00:00Z',
        isPaid: false,
        paymentRequested: false,
      });

      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'manager', _id: managerId.toString() };
        next();
      });

      const res = await request(app).delete(`/api/fines/${fine._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Fine deleted successfully.');

      const deletedFine = await Fine.findById(fine._id);
      expect(deletedFine).toBeNull();
      log.separator();
    });

    it('should fail if fine does not exist', async () => {
      log.test('Running test: should fail if fine does not exist');
      const managerId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');

      await User.create({
        _id: managerId,
        email: 'manager@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Manager',
        role: 'manager',
      });

      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'manager', _id: managerId.toString() };
        next();
      });

      const res = await request(app).delete(`/api/fines/${new mongoose.Types.ObjectId()}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Fine not found.');
      log.separator();
    });
  });
});