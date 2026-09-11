const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app.js');
const User = require('../../src/models/user.model.js');

let mongoServer;

describe('User Registration Endpoint', () => {
  beforeAll(async () => {
    // Set up in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Disconnect any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Connect to in-memory MongoDB
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Clear database after each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('new user is added to database');
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.name).toBe('Test User');
      expect(res.body.data.username).toBe('testuser');
      expect(res.body.data.email).toBe('test@example.com');
      // Password should not be returned
      expect(res.body.data.password).toBeUndefined();
    });

    it('should return 400 if missing fields', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Incomplete User'
          // missing username, email, password
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('All fields are required.');
    });

    it('should return 409 if user already exists', async () => {
      // First, create a user
      await request(app)
        .post('/api/users/register')
        .send({
          name: 'First User',
          username: 'firstuser',
          email: 'first@example.com',
          password: 'password123'
        });

      // Now try to register with the same username or email
      const res = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Second User',
          username: 'firstuser', // duplicate username
          email: 'second@example.com',
          password: 'password123'
        })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('user already exist');
    });
  });
});