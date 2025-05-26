const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const log = require('../utils/logger');
const app = require('../../app');
const User = require('../../models/User');


jest.mock('../../middleware/openaiService', () => ({
  generateText: jest.fn().mockResolvedValue('Mocked response from OpenAI'),
}));
// Setează timeout-ul global
jest.setTimeout(30000);

let mongoServer;

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
  const password = await bcrypt.hash('parola123', 10);
  await User.create({
    email: 'test@example.com',
    password,
    name: 'Test User',
    role: 'player',
    playerId: null,
    managerId: null,
    staffId: null,
    _id: new mongoose.Types.ObjectId(),
  });
  log.success('Database cleared and user created');
}, 30000);

describe('POST /api/users/login', () => {
  it('should login a valid user', async () => {
    log.test('Running test: should login a valid user');
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'parola123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({
      email: 'test@example.com',
      name: 'Test User',
      role: 'player',
    });
    log.separator();
  });

  it('should fail with wrong password', async () => {
    log.test('Running test: should fail with wrong password');
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'gresit',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Email sau parolă incorectă');
    log.separator();
  });

  it('should fail with invalid email format', async () => {
    log.test('Running test: should fail with invalid email format');
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'invalid-email',
        password: 'parola123',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Date invalide');
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Introdu un email valid' }),
      ])
    );
    log.separator();
  });

  it('should fail with non-existent email', async () => {
    log.test('Running test: should fail with non-existent email');
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'parola123',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Email sau parolă incorectă');
    log.separator();
  });

  it('should fail with missing password', async () => {
    log.test('Running test: should fail with missing password');
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: '',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Date invalide');
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Parola este obligatorie' }),
      ])
    );
    log.separator();
  });

  it('should fail with missing email', async () => {
    log.test('Running test: should fail with missing email');
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: '',
        password: 'parola123',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Date invalide');
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Introdu un email valid' }),
      ])
    );
    log.separator();
  });
});