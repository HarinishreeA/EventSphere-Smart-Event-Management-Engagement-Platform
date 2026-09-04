const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');

let adminToken;

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

const setupAdmin = async () => {
  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Faculty Admin',
      email: 'admin@campus.edu',
      password: 'adminpassword',
      role: 'admin',
    });
  adminToken = adminRes.body.token;
};

describe('Event CRUD Operations Tests', () => {
  beforeEach(async () => {
    await setupAdmin();
  });

  it('should create an event, retrieve it, update it, and delete it', async () => {
    // 1. Create Event
    const createRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Annual Robotics Expo',
        description: 'Robotics competition and exhibition',
        category: 'Competition',
        date: '2026-11-10',
        time: '09:00 AM - 04:00 PM',
        location: 'Mechanical Block',
        organizer: 'Robotics Club',
        capacity: 75,
      });

    expect(createRes.statusCode).toBe(201);
    const eventId = createRes.body._id;

    // 2. Get Event by ID
    const getRes = await request(app).get(`/api/events/${eventId}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.title).toBe('Annual Robotics Expo');

    // 3. Update Event
    const updateRes = await request(app)
      .put(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Annual Robotics & AI Expo',
        capacity: 100,
      });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.title).toBe('Annual Robotics & AI Expo');
    expect(updateRes.body.capacity).toBe(100);

    // 4. Delete Event
    const deleteRes = await request(app)
      .delete(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.statusCode).toBe(200);

    // 5. Verify Event is deleted
    const verifyRes = await request(app).get(`/api/events/${eventId}`);
    expect(verifyRes.statusCode).toBe(404);
  });
});
