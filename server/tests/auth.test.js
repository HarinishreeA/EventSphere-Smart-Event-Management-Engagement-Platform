const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Authentication Flow Tests', () => {
  it('should register a new student user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@campus.edu',
        password: 'password123',
        role: 'student',
        department: 'Computer Science',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe('jane@campus.edu');
    expect(res.body.role).toBe('student');
  });

  it('should reject registration with duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@campus.edu',
        password: 'password123',
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Smith',
        email: 'jane@campus.edu',
        password: 'password456',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('already exists');
  });

  it('should authenticate user and return JWT token on login', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Student',
        email: 'john@campus.edu',
        password: 'securepassword',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@campus.edu',
        password: 'securepassword',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.name).toBe('John Student');
  });

  it('should reject login with wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Student',
        email: 'john@campus.edu',
        password: 'securepassword',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@campus.edu',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toContain('Invalid email or password');
  });

  it('should retrieve current logged-in user profile with valid Bearer token', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Springs',
        email: 'alice@campus.edu',
        password: 'password123',
      });

    const token = regRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('alice@campus.edu');
  });
});
