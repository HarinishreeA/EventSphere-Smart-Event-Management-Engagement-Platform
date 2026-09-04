const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');

let adminToken;
let student1Token;
let student2Token;
let student3Token;
let eventId;

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

const setupTestEnvironment = async () => {
  // Register Admin
  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin', email: 'admin@campus.edu', password: 'password123', role: 'admin' });
  adminToken = adminRes.body.token;

  // Register 3 Students
  const s1 = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Student 1', email: 's1@campus.edu', password: 'password123' });
  student1Token = s1.body.token;

  const s2 = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Student 2', email: 's2@campus.edu', password: 'password123' });
  student2Token = s2.body.token;

  const s3 = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Student 3', email: 's3@campus.edu', password: 'password123' });
  student3Token = s3.body.token;

  // Create Event with Capacity = 2 (for testing waitlist!)
  const eventRes = await request(app)
    .post('/api/events')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'Limited Seat Workshop',
      description: 'Exclusive lab event with capacity of 2',
      category: 'Workshop',
      date: '2026-12-01',
      time: '10:00 AM',
      location: 'Lab 1',
      organizer: 'CS Club',
      capacity: 2,
    });
  eventId = eventRes.body._id;
};

describe('RSVP, Capacity Limit & Waitlist Promotion Logic Tests', () => {
  beforeEach(async () => {
    await setupTestEnvironment();
  });

  it('should confirm RSVP when capacity is available', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${student1Token}`);

    expect(res.statusCode).toBe(201);
    expect(res.body.rsvp.status).toBe('confirmed');
    expect(res.body.event.attendeeCount).toBe(1);
  });

  it('should prevent duplicate RSVPs from the same user (400 Bad Request)', async () => {
    // First RSVP
    await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${student1Token}`);

    // Duplicate RSVP attempt
    const duplicateRes = await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${student1Token}`);

    expect(duplicateRes.statusCode).toBe(400);
    expect(duplicateRes.body.message).toContain('already');
  });

  it('should automatically assign waitlisted status when capacity is full', async () => {
    // Student 1 RSVPs (Spot 1 of 2 confirmed)
    await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${student1Token}`);

    // Student 2 RSVPs (Spot 2 of 2 confirmed)
    await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${student2Token}`);

    // Student 3 RSVPs (Capacity reached -> Waitlisted!)
    const waitlistRes = await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${student3Token}`);

    expect(waitlistRes.statusCode).toBe(201);
    expect(waitlistRes.body.rsvp.status).toBe('waitlisted');
    expect(waitlistRes.body.event.attendeeCount).toBe(2);
    expect(waitlistRes.body.event.waitlistCount).toBe(1);
  });

  it('should promote the oldest waitlisted user when a confirmed user cancels RSVP', async () => {
    // Student 1 & 2 fill capacity
    await request(app).post(`/api/events/${eventId}/rsvp`).set('Authorization', `Bearer ${student1Token}`);
    await request(app).post(`/api/events/${eventId}/rsvp`).set('Authorization', `Bearer ${student2Token}`);

    // Student 3 gets waitlisted
    await request(app).post(`/api/events/${eventId}/rsvp`).set('Authorization', `Bearer ${student3Token}`);

    // Student 1 cancels their confirmed RSVP
    const cancelRes = await request(app)
      .delete(`/api/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${student1Token}`);

    expect(cancelRes.statusCode).toBe(200);
    expect(cancelRes.body.promotedUser).toBe('Student 3');
    expect(cancelRes.body.event.attendeeCount).toBe(2);
    expect(cancelRes.body.event.waitlistCount).toBe(0);
  });
});
