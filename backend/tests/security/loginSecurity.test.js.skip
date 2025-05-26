const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
      version: '5.0.0'
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
  log.info('Creating user...');
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
  log.success('User created');
}, 30000);

describe('Security Tests for POST /api/users/login', () => {
  it('should not expose sensitive information in error messages', async () => {
    log.test('Running test: should not expose sensitive information in error messages');
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Email sau parolă incorectă');
    // Verificăm că mesajul nu dezvăluie dacă email-ul există sau nu
    expect(res.body.message).not.toMatch(/email.*nu.*există/i);
    log.separator();
  });

  it('should reject potentially malicious input (SQL Injection attempt)', async () => {
    log.test('Running test: should reject potentially malicious input (SQL Injection attempt)');
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: "test@example.com' OR '1'='1",
        password: 'parola123',
      });

    expect(res.statusCode).toBe(400); // Așteptăm 400 din cauza validării stricte
    expect(res.body).toHaveProperty('message', 'Date invalide');
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Email-ul conține caractere nepermise' }),
      ])
    );
    log.separator();
  });

  it('should not include sensitive data in JWT token', async () => {
    log.test('Running test: should not include sensitive data in JWT token');
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'parola123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');

    const decoded = jwt.verify(res.body.token, 'test-secret');
    expect(decoded).toHaveProperty('id');
    expect(decoded).toHaveProperty('role');
    expect(decoded).not.toHaveProperty('password'); // Parola nu trebuie să fie în token
    expect(decoded).not.toHaveProperty('email'); // Email-ul nu trebuie să fie în token
    log.separator();
  });
});