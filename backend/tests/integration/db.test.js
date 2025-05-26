const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const log = require('../utils/logger');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  log.info(`MongoMemoryServer URI: ${uri}`);
  try {
    await mongoose.connect(uri);
    log.success(`MongoDB connected, state: ${mongoose.connection.readyState}`);
  } catch (error) {
    log.error(`Failed to connect to MongoDB: ${error.message}`);
    throw error;
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
    log.success('Database dropped');
    
  await mongoose.connection.close();
  log.success('MongoDB connection closed');
  await mongoServer.stop();
  log.success('MongoMemoryServer stopped');
});

describe('MongoDB Connection', () => {
  it('should be connected', () => {
    log.test('Running test: should be connected');
    expect(mongoose.connection.readyState).toBe(1); 
  });
});