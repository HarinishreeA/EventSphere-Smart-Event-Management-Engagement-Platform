const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');

let studentToken;
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

const setupUsers = async () => {
  const studentRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Regular Student',
      email: 'student@campus.edu',
      password: 'password123',
      role: 'student',
    });
  studentToken = studentRes.body.token;

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

describe('Role-Based Access Control (RBAC) Tests', () => {
  beforeEach(async () => {
    await setupUsers();
  });

  it('should prevent student users from creating an event (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Unauthorized Event',
        description: 'Testing RBAC restriction',
        category: 'Fest',
        date: '2026-10-01',
        time: '10:00 AM',
        location: 'Hall A',
        organizer: 'Student Club',
        capacity: 50,
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toContain('not authorized');
  });

  it('should allow admin users to create an event (201 Created)', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Official Admin Event',
        description: 'Created by faculty admin',
        category: 'Fest',
        date: '2026-10-01',
        time: '10:00 AM',
        location: 'Hall A',
        organizer: 'Dean Office',
        capacity: 100,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Official Admin Event');
  });

  it('should prevent students from accessing admin stats dashboard endpoint', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('should allow admin users to access admin stats dashboard endpoint', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalEvents');
  });

  it('should prevent admin users from RSVPing to an event (403 Forbidden)', async () => {
    const eventRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Sample Event',
        description: 'Testing admin RSVP restriction',
        category: 'Fest',
        date: '2026-10-01',
        time: '10:00 AM',
        location: 'Hall A',
        organizer: 'Dean Office',
        capacity: 100,
      });

    const eventId = eventRes.body._id;

    const rsvpRes = await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(rsvpRes.statusCode).toBe(403);
    expect(rsvpRes.body.message).toContain('not authorized');
  });

  it('should prevent admin users from accessing student /my-events endpoint (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/rsvp/my-events')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toContain('not authorized');
  });
});
