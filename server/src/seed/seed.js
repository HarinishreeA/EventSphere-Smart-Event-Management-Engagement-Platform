const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_event_manager';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collection records
    await User.deleteMany({});
    await Event.deleteMany({});
    await RSVP.deleteMany({});

    console.log('Cleared existing database records.');

    // Create Admin User
    const admin = await User.create({
      name: 'Dr. Sarah Jenkins (Faculty Lead)',
      email: 'admin@campus.edu',
      password: 'admin123',
      role: 'admin',
      department: 'Computer Science & Engineering',
    });

    // Create Student Users
    const student1 = await User.create({
      name: 'Alex Rivera',
      email: 'student1@campus.edu',
      password: 'student123',
      role: 'student',
      department: 'Information Technology',
      studentId: 'CS2026-042',
    });

    const student2 = await User.create({
      name: 'Maya Patel',
      email: 'student2@campus.edu',
      password: 'student123',
      role: 'student',
      department: 'Electronics Engineering',
      studentId: 'EC2026-108',
    });

    const student3 = await User.create({
      name: 'Jordan Vance',
      email: 'student3@campus.edu',
      password: 'student123',
      role: 'student',
      department: 'Mechanical Engineering',
      studentId: 'ME2026-077',
    });

    console.log('Created admin and student accounts.');

    // Create Sample Events
    const events = [
      {
        title: 'Innovate 2026: Annual Campus Tech Symposium',
        description: 'Join us for the premier annual campus tech fest featuring keynote speakers, live project expos, coding challenges, and interactive VR demos! Food stalls and merchandise provided for all registered participants.',
        category: 'Fest',
        date: new Date('2026-09-15T09:00:00.000Z'),
        time: '09:00 AM - 05:00 PM',
        location: 'Main University Ground & Auditorium',
        organizer: 'Department of Computer Science',
        capacity: 150,
        attendeeCount: 2,
        waitlistCount: 0,
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
        status: 'upcoming',
        createdBy: admin._id,
      },
      {
        title: 'Full-Stack Web Development Masterclass',
        description: 'Hands-on intensive workshop building modern web applications using React, Node.js, and MongoDB. Learn modern architecture, RESTful API design, state management, and cloud deployment strategies.',
        category: 'Workshop',
        date: new Date('2026-09-20T14:00:00.000Z'),
        time: '02:00 PM - 06:00 PM',
        location: 'CS Lab 3, Tech Block B',
        organizer: 'ACM Student Chapter',
        capacity: 40,
        attendeeCount: 1,
        waitlistCount: 0,
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80',
        status: 'upcoming',
        createdBy: admin._id,
      },
      {
        title: 'Guest Lecture: Quantum Computing & The Future of Encryption',
        description: 'Distinguished lecture by Dr. Alan Turing Institute fellow on quantum supremacy, post-quantum cryptography algorithms, and their implications for global network security.',
        category: 'Guest Lecture',
        date: new Date('2026-09-25T11:00:00.000Z'),
        time: '11:00 AM - 01:00 PM',
        location: 'APJ Abdul Kalam Seminar Hall',
        organizer: 'Research & Development Cell',
        capacity: 80,
        attendeeCount: 0,
        waitlistCount: 0,
        imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1000&q=80',
        status: 'upcoming',
        createdBy: admin._id,
      },
      {
        title: '24-Hour Hackathon: CodeForGood 2026',
        description: 'Collaborate in teams of 2-4 to design and build high-impact digital solutions addressing environmental sustainability and community welfare. Win cash prizes totaling $5,000!',
        category: 'Competition',
        date: new Date('2026-10-02T10:00:00.000Z'),
        time: '10:00 AM - 10:00 AM (Next Day)',
        location: 'Student Activity Center (SAC)',
        organizer: 'Innovation & Entrepreneurship Cell',
        capacity: 100,
        attendeeCount: 0,
        waitlistCount: 0,
        imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80',
        status: 'upcoming',
        createdBy: admin._id,
      },
      {
        title: 'Symphony 2026: Campus Cultural Gala',
        description: 'An enchanting evening of live music performances, battle of the bands, classical dance recitals, theatrical drama, and culinary delights hosted by student clubs.',
        category: 'Cultural',
        date: new Date('2026-10-10T17:00:00.000Z'),
        time: '05:00 PM - 10:00 PM',
        location: 'Open Air Amphitheatre',
        organizer: 'Campus Cultural Society',
        capacity: 250,
        attendeeCount: 0,
        waitlistCount: 0,
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
        status: 'upcoming',
        createdBy: admin._id,
      },
      {
        title: 'Exclusive Robotics Lab Hands-On Session',
        description: 'Limited seat micro-workshop on micro-controller programming, sensor integration, and motor kinematics for autonomous mobile robots.',
        category: 'Workshop',
        date: new Date('2026-10-18T10:00:00.000Z'),
        time: '10:00 AM - 01:00 PM',
        location: 'Robotics Center, Mechanical Wing',
        organizer: 'Robotics Club',
        capacity: 2, // Low capacity for testing waitlist!
        attendeeCount: 2,
        waitlistCount: 1,
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80',
        status: 'upcoming',
        createdBy: admin._id,
      },
      {
        title: 'Inter-Departmental Football Championship',
        description: 'Annual knock-out tournament for campus football glory! Show your departmental spirit and cheer for your teams as they clash for the championship trophy.',
        category: 'Sports',
        date: new Date('2026-10-22T15:00:00.000Z'),
        time: '03:00 PM - 07:00 PM',
        location: 'University Sports Complex Field A',
        organizer: 'Department of Physical Education',
        capacity: 200,
        attendeeCount: 0,
        waitlistCount: 0,
        imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80',
        status: 'upcoming',
        createdBy: admin._id,
      },
    ];

    const createdEvents = await Event.insertMany(events);
    console.log(`Seeded ${createdEvents.length} campus events.`);

    // Create Initial RSVPs
    // Student 1 & Student 2 RSVP to Innovate 2026
    await RSVP.create({
      user: student1._id,
      event: createdEvents[0]._id,
      status: 'confirmed',
    });

    await RSVP.create({
      user: student2._id,
      event: createdEvents[0]._id,
      status: 'confirmed',
    });

    // Student 1 RSVP to Masterclass
    await RSVP.create({
      user: student1._id,
      event: createdEvents[1]._id,
      status: 'confirmed',
    });

    // Robotics Lab (Capacity 2): Student 1 & Student 2 confirmed, Student 3 waitlisted!
    await RSVP.create({
      user: student1._id,
      event: createdEvents[5]._id,
      status: 'confirmed',
    });
    await RSVP.create({
      user: student2._id,
      event: createdEvents[5]._id,
      status: 'confirmed',
    });
    await RSVP.create({
      user: student3._id,
      event: createdEvents[5]._id,
      status: 'waitlisted',
    });

    console.log('Seeded sample RSVPs and waitlist entries.');
    console.log('==============================================');
    console.log('Seed completed successfully!');
    console.log('Default Accounts:');
    console.log('Admin:   email: admin@campus.edu    password: admin123');
    console.log('Student: email: student1@campus.edu password: student123');
    console.log('Student: email: student2@campus.edu password: student123');
    console.log('==============================================');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
