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

const seedEvents = async () => {
  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Faculty Admin',
      email: 'admin@campus.edu',
      password: 'adminpassword',
      role: 'admin',
    });
  adminToken = adminRes.body.token;

  // Create 15 sample events across categories
  for (let i = 1; i <= 15; i++) {
    await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `Campus Event ${i}`,
        description: `Description for campus event ${i}`,
        category: i % 2 === 0 ? 'Workshop' : 'Fest',
        date: new Date(Date.now() + i * 86400000).toISOString(),
        time: '10:00 AM',
        location: `Auditorium ${i}`,
        organizer: 'Campus Club',
        capacity: 50,
      });
  }
};

describe('Pagination & Filtering Edge Case Tests', () => {
  beforeEach(async () => {
    await seedEvents();
  });

  it('should return first page of events with correct pagination metadata', async () => {
    const res = await request(app).get('/api/events?page=1&limit=5');

    expect(res.statusCode).toBe(200);
    expect(res.body.events.length).toBe(5);
    expect(res.body.page).toBe(1);
    expect(res.body.pages).toBe(3);
    expect(res.body.total).toBe(15);
  });

  it('should return empty events array for out-of-bounds page numbers without erroring', async () => {
    const res = await request(app).get('/api/events?page=99&limit=5');

    expect(res.statusCode).toBe(200);
    expect(res.body.events.length).toBe(0);
    expect(res.body.page).toBe(99);
    expect(res.body.pages).toBe(3);
    expect(res.body.total).toBe(15);
  });

  it('should fallback gracefully when page or limit are invalid or negative', async () => {
    const res = await request(app).get('/api/events?page=-5&limit=-10');

    expect(res.statusCode).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(6); // default limit fallback
  });

  it('should filter events correctly by category', async () => {
    const res = await request(app).get('/api/events?category=Workshop');

    expect(res.statusCode).toBe(200);
    expect(res.body.events.every(e => e.category === 'Workshop')).toBe(true);
  });

  it('should filter events correctly by search keyword query', async () => {
    const res = await request(app).get('/api/events?search=Event 12');

    expect(res.statusCode).toBe(200);
    expect(res.body.events.length).toBe(1);
    expect(res.body.events[0].title).toBe('Campus Event 12');
  });
});
