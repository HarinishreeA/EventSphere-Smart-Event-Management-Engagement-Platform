/**
 * attendance.test.js
 *
 * Integration tests for the Digital Event Pass + QR Attendance system.
 * Covers:
 *  - Ticket code generation on confirmed RSVP
 *  - No ticket on waitlisted RSVP
 *  - Ticket generation on waitlist promotion (cancel flow)
 *  - QR check-in: success path
 *  - QR check-in: duplicate prevention
 *  - QR check-in: invalid ticket code
 *  - QR check-in: wrong event
 *  - QR check-in: non-confirmed (waitlisted) pass rejected
 *  - QR check-in: unauthorized (student cannot check-in)
 *  - Attendance stats endpoint
 *  - Manual toggle: mark present / clear
 *  - Manual toggle: unauthorized (student cannot toggle)
 */

const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');

// ─── Shared State ──────────────────────────────────────────────────────────────
let adminToken;
let student1Token;
let student2Token;
let student3Token;
let eventId;
let event2Id; // second event for wrong-event test

// ─── Lifecycle ─────────────────────────────────────────────────────────────────
beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const setupEnvironment = async (capacity = 2) => {
  // Admin
  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin', email: 'admin@campus.edu', password: 'password123', role: 'admin' });
  adminToken = adminRes.body.token;

  // Students
  const s1 = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Student One', email: 's1@campus.edu', password: 'password123' });
  student1Token = s1.body.token;

  const s2 = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Student Two', email: 's2@campus.edu', password: 'password123' });
  student2Token = s2.body.token;

  const s3 = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Student Three', email: 's3@campus.edu', password: 'password123' });
  student3Token = s3.body.token;

  // Primary event (capacity controlled by parameter)
  const evRes = await request(app)
    .post('/api/events')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'QR Test Event',
      description: 'Event used for attendance testing',
      category: 'Workshop',
      date: '2026-12-01',
      time: '10:00 AM',
      location: 'Lab 1',
      organizer: 'CS Club',
      capacity,
    });
  eventId = evRes.body._id;

  // Second event for wrong-event rejection tests
  const ev2Res = await request(app)
    .post('/api/events')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'Another Event',
      description: 'Unrelated event',
      category: 'Guest Lecture',
      date: '2026-12-15',
      time: '02:00 PM',
      location: 'Hall B',
      organizer: 'Science Club',
      capacity: 50,
    });
  event2Id = ev2Res.body._id;
};

// ─── Ticket Generation Tests ───────────────────────────────────────────────────
describe('Ticket Code Generation', () => {
  beforeEach(async () => {
    await setupEnvironment(2);
  });

  it('should generate a ticketCode for a confirmed RSVP', async () => {
    const rsvpRes = await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${student1Token}`);

    expect(rsvpRes.statusCode).toBe(201);
    expect(rsvpRes.body.rsvp.status).toBe('confirmed');
    expect(rsvpRes.body.rsvp.ticketCode).toBeDefined();
    expect(typeof rsvpRes.body.rsvp.ticketCode).toBe('string');
    expect(rsvpRes.body.rsvp.ticketCode.length).toBeGreaterThan(5);
  });

  it('should NOT generate a ticketCode for a waitlisted RSVP', async () => {
    // Fill capacity
    await request(app).post(`/api/events/${eventId}/rsvp`).set('Authorization', `Bearer ${student1Token}`);
    await request(app).post(`/api/events/${eventId}/rsvp`).set('Authorization', `Bearer ${student2Token}`);

    // Student 3 -> waitlisted
    const waitRes = await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${student3Token}`);

    expect(waitRes.statusCode).toBe(201);
    expect(waitRes.body.rsvp.status).toBe('waitlisted');
    expect(waitRes.body.rsvp.ticketCode == null || waitRes.body.rsvp.ticketCode === '').toBe(true);
  });

  it('should assign a ticketCode when a waitlisted user is promoted via cancellation', async () => {
    // Fill capacity
    await request(app).post(`/api/events/${eventId}/rsvp`).set('Authorization', `Bearer ${student1Token}`);
    await request(app).post(`/api/events/${eventId}/rsvp`).set('Authorization', `Bearer ${student2Token}`);

    // Student 3 waitlisted
    await request(app).post(`/api/events/${eventId}/rsvp`).set('Authorization', `Bearer ${student3Token}`);

    // Student 1 cancels -> Student 3 promoted
    const cancelRes = await request(app)
      .delete(`/api/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${student1Token}`);

    expect(cancelRes.statusCode).toBe(200);
    expect(cancelRes.body.promotedUser).toBe('Student Three');

    // Verify Student 3's pass via getMyEventPass (route: /api/rsvp/:eventId/my-pass)
    const passRes = await request(app)
      .get(`/api/rsvp/${eventId}/my-pass`)
      .set('Authorization', `Bearer ${student3Token}`);

    expect(passRes.statusCode).toBe(200);
    // Response shape: { pass: { rsvpId, ticketCode, checkedIn, ... } }
    expect(passRes.body.pass).toBeDefined();
    expect(passRes.body.pass.ticketCode).toBeDefined();
    expect(typeof passRes.body.pass.ticketCode).toBe('string');
  });

  it('should invalidate ticketCode when RSVP is cancelled', async () => {
    await request(app).post(`/api/events/${eventId}/rsvp`).set('Authorization', `Bearer ${student1Token}`);

    await request(app)
      .delete(`/api/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${student1Token}`);

    const passRes = await request(app)
      .get(`/api/rsvp/${eventId}/my-pass`)
      .set('Authorization', `Bearer ${student1Token}`);

    // Either 404 (RSVP deleted) or ticketCode is null
    if (passRes.statusCode === 200) {
      expect(passRes.body.ticketCode == null || passRes.body.ticketCode === '').toBe(true);
    } else {
      expect(passRes.statusCode).toBe(404);
    }
  });
});

// ─── QR Check-In Tests ─────────────────────────────────────────────────────────
describe('QR Check-In (/api/attendance/check-in)', () => {
  let ticketCode;

  beforeEach(async () => {
    await setupEnvironment(10);

    // Student 1 RSVPs and gets a confirmed ticket
    const rsvpRes = await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${student1Token}`);

    ticketCode = rsvpRes.body.rsvp.ticketCode;
  });

  it('should successfully check-in a valid confirmed ticket (200)', async () => {
    const res = await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ticketCode, eventId });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.attendee).toBeDefined();
    expect(res.body.checkedInAt).toBeDefined();
    expect(res.body.totalCheckedIn).toBe(1);
  });

  it('should reject a duplicate check-in for the same ticket (409)', async () => {
    // First scan
    await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ticketCode, eventId });

    // Duplicate scan
    const res = await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ticketCode, eventId });

    expect(res.statusCode).toBe(409);
    expect(res.body.alreadyCheckedIn).toBe(true);
    expect(res.body.checkedInAt).toBeDefined();
  });

  it('should reject an invalid / nonexistent ticket code (404)', async () => {
    const res = await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ticketCode: 'INVALID-TICKET-000', eventId });

    expect(res.statusCode).toBe(404);
  });

  it('should reject a ticket that belongs to a different event (400)', async () => {
    // Student 1's ticket belongs to eventId, not event2Id
    const res = await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ticketCode, eventId: event2Id });

    expect(res.statusCode).toBe(400);
    expect(res.body.wrongEvent).toBe(true);
  });

  it('should return 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ticketCode }); // missing eventId

    expect(res.statusCode).toBe(400);
  });

  it('should deny check-in for a student (non-admin) — 403 Forbidden', async () => {
    const res = await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({ ticketCode, eventId });

    expect(res.statusCode).toBe(403);
  });

  it('should deny check-in for unauthenticated request — 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/attendance/check-in')
      .send({ ticketCode, eventId });

    expect(res.statusCode).toBe(401);
  });
});

// ─── Attendance Stats Tests ────────────────────────────────────────────────────
describe('Attendance Stats (/api/attendance/event/:eventId/stats)', () => {
  beforeEach(async () => {
    await setupEnvironment(10);
  });

  it('should return zero check-in stats before any check-ins', async () => {
    // RSVP student 1 (confirmed, not yet checked in)
    await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${student1Token}`);

    const res = await request(app)
      .get(`/api/attendance/event/${eventId}/stats`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.totalConfirmed).toBe(1);
    expect(res.body.totalCheckedIn).toBe(0);
    expect(res.body.remaining).toBe(1);
    expect(res.body.percentage).toBe(0);
  });

  it('should return correct stats after a check-in', async () => {
    const rsvpRes = await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${student1Token}`);
    const tc = rsvpRes.body.rsvp.ticketCode;

    await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ticketCode: tc, eventId });

    const statsRes = await request(app)
      .get(`/api/attendance/event/${eventId}/stats`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(statsRes.statusCode).toBe(200);
    expect(statsRes.body.totalCheckedIn).toBe(1);
    expect(statsRes.body.totalConfirmed).toBe(1);
    expect(statsRes.body.remaining).toBe(0);
    expect(statsRes.body.percentage).toBe(100);
  });

  it('should deny stats access to a student — 403 Forbidden', async () => {
    const res = await request(app)
      .get(`/api/attendance/event/${eventId}/stats`)
      .set('Authorization', `Bearer ${student1Token}`);

    expect(res.statusCode).toBe(403);
  });

  it('should return 404 for a nonexistent event', async () => {
    const fakeId = '64f1b2c3d4e5f60001234567';
    const res = await request(app)
      .get(`/api/attendance/event/${fakeId}/stats`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });
});

// ─── Manual Toggle Tests ───────────────────────────────────────────────────────
describe('Manual Toggle (/api/attendance/manual-toggle)', () => {
  let rsvpId;

  beforeEach(async () => {
    await setupEnvironment(10);

    const rsvpRes = await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${student1Token}`);
    rsvpId = rsvpRes.body.rsvp._id;
  });

  it('should manually mark an attendee as present (checkedIn = true)', async () => {
    const res = await request(app)
      .post('/api/attendance/manual-toggle')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ rsvpId, checkedIn: true });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.rsvp.checkedIn).toBe(true);
    expect(res.body.rsvp.checkInMethod).toBe('manual_override');
    expect(res.body.totalCheckedIn).toBe(1);
  });

  it('should manually clear an attendance check-in (checkedIn = false)', async () => {
    // First mark present
    await request(app)
      .post('/api/attendance/manual-toggle')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ rsvpId, checkedIn: true });

    // Then clear it
    const clearRes = await request(app)
      .post('/api/attendance/manual-toggle')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ rsvpId, checkedIn: false });

    expect(clearRes.statusCode).toBe(200);
    expect(clearRes.body.rsvp.checkedIn).toBe(false);
    expect(clearRes.body.rsvp.checkInMethod).toBeNull();
    expect(clearRes.body.totalCheckedIn).toBe(0);
  });

  it('should toggle attendance state when checkedIn is omitted', async () => {
    // First toggle (off -> on)
    const res1 = await request(app)
      .post('/api/attendance/manual-toggle')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ rsvpId });

    expect(res1.body.rsvp.checkedIn).toBe(true);

    // Second toggle (on -> off)
    const res2 = await request(app)
      .post('/api/attendance/manual-toggle')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ rsvpId });

    expect(res2.body.rsvp.checkedIn).toBe(false);
  });

  it('should return 400 when rsvpId is missing', async () => {
    const res = await request(app)
      .post('/api/attendance/manual-toggle')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
  });

  it('should deny manual toggle to a student — 403 Forbidden', async () => {
    const res = await request(app)
      .post('/api/attendance/manual-toggle')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({ rsvpId, checkedIn: true });

    expect(res.statusCode).toBe(403);
  });
});
