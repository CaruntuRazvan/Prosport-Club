const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const log = require('../utils/logger');
const app = require('../../app');
const User = require('../../models/User');
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
  req.user = { role: 'player', _id: mockUserId };
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
  await Notification.deleteMany();
  log.success('Database cleared');
}, 30000);

describe('Notification Routes Integration Tests', () => {
  describe('GET /api/notifications/:userId - Get Notifications', () => {
    it('should return notifications for a user with unread count', async () => {
      log.test('Running test: should return notifications for a user with unread count');
      const userId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');
      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'player', _id: userId.toString() };
        next();
      });

      await User.create({
        _id: userId,
        email: 'player@example.com',
        password: 'hashedpassword',
        name: 'Test Player',
        role: 'player',
      });

      await Notification.create([
        {
          userId,
          type: 'poll',
          title: 'New Poll',
          description: 'A new poll has been created',
          actionLink: 'poll_123',
          section: 'polls',
          createdAt: new Date(),
          isRead: false,
        },
        {
          userId,
          type: 'poll',
          title: 'Poll Reminder',
          description: 'Reminder to vote in poll',
          actionLink: 'poll_123',
          section: 'polls',
          createdAt: new Date(),
          isRead: true,
        },
      ]);

      const res = await request(app).get(`/api/notifications/${userId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('notifications');
      expect(res.body.notifications).toHaveLength(2);
      expect(res.body).toHaveProperty('unreadCount', 1);
      expect(res.body.notifications).toContainEqual(
        expect.objectContaining({
          title: 'New Poll',
          isRead: false,
        })
      );
      expect(res.body.notifications).toContainEqual(
        expect.objectContaining({
          title: 'Poll Reminder',
          isRead: true,
        })
      );
      log.separator();
    });

    it('should handle errors when fetching notifications', async () => {
      log.test('Running test: should handle errors when fetching notifications');
      const userId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');
      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'player', _id: userId.toString() };
        next();
      });

      // Simulăm o eroare prin deconectarea de la MongoDB temporar
      await mongoose.disconnect();

      const res = await request(app).get(`/api/notifications/${userId}`);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Eroare la obținerea notificărilor');
      log.separator();

      // Reconectăm pentru testele ulterioare
      await mongoose.connect(mongoServer.getUri(), {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
        dbName: 'testdb',
      });
    });
  });

  describe('PATCH /api/notifications/:id/read - Mark Notification as Read', () => {
    it('should mark a notification as read', async () => {
      log.test('Running test: should mark a notification as read');
      const userId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');
      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'player', _id: userId.toString() };
        next();
      });

      const notification = await Notification.create({
        userId,
        type: 'poll',
        title: 'New Poll',
        description: 'A new poll has been created',
        actionLink: 'poll_123',
        section: 'polls',
        createdAt: new Date(),
        isRead: false,
      });

      const res = await request(app).patch(`/api/notifications/${notification._id}/read`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Notificarea a fost marcată ca citită');
      expect(res.body.notification).toMatchObject({
        isRead: true,
      });

      const updatedNotification = await Notification.findById(notification._id);
      expect(updatedNotification.isRead).toBe(true);
      log.separator();
    });

    it('should fail if notification does not exist', async () => {
      log.test('Running test: should fail if notification does not exist');
      const userId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');
      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'player', _id: userId.toString() };
        next();
      });

      const res = await request(app).patch(`/api/notifications/${new mongoose.Types.ObjectId()}/read`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Notificarea nu a fost găsită');
      log.separator();
    });
  });

  describe('PATCH /api/notifications/mark-all-read - Mark All Notifications as Read', () => {
    it('should mark all notifications as read for a user', async () => {
      log.test('Running test: should mark all notifications as read for a user');
      const userId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');
      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'player', _id: userId.toString() };
        next();
      });

      await Notification.create([
        {
          userId,
          type: 'poll',
          title: 'New Poll',
          description: 'A new poll has been created',
          actionLink: 'poll_123',
          section: 'polls',
          createdAt: new Date(),
          isRead: false,
        },
        {
          userId,
          type: 'poll',
          title: 'Poll Reminder',
          description: 'Reminder to vote in poll',
          actionLink: 'poll_123',
          section: 'polls',
          createdAt: new Date(),
          isRead: false,
        },
      ]);

      const res = await request(app).patch('/api/notifications/mark-all-read');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Toate notificările au fost marcate ca citite');
      expect(res.body).toHaveProperty('modifiedCount', 2);

      const unreadNotifications = await Notification.find({ userId, isRead: false });
      expect(unreadNotifications).toHaveLength(0);
      log.separator();
    });
  });

  describe('DELETE /api/notifications/:id - Delete a Notification', () => {
    it('should delete a notification', async () => {
      log.test('Running test: should delete a notification');
      const userId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');
      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'player', _id: userId.toString() };
        next();
      });

      const notification = await Notification.create({
        userId,
        type: 'poll',
        title: 'New Poll',
        description: 'A new poll has been created',
        actionLink: 'poll_123',
        section: 'polls',
        createdAt: new Date(),
        isRead: false,
      });

      const res = await request(app).delete(`/api/notifications/${notification._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Notificarea a fost ștearsă');

      const deletedNotification = await Notification.findById(notification._id);
      expect(deletedNotification).toBeNull();
      log.separator();
    });

    it('should fail if notification does not exist', async () => {
      log.test('Running test: should fail if notification does not exist');
      const userId = new mongoose.Types.ObjectId();
      const authMock = jest.requireMock('../../middleware/auth');
      authMock.mockImplementation((req, res, next) => {
        req.user = { role: 'player', _id: userId.toString() };
        next();
      });

      const res = await request(app).delete(`/api/notifications/${new mongoose.Types.ObjectId()}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Notificarea nu a fost găsită');
      log.separator();
    });
  });
});