/**
 * Database seed script.
 * Creates a sample competition and test users for development.
 *
 * Usage: node seed.js
 */
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./src/models/User');
const Competition = require('./src/models/Competition');
const Participation = require('./src/models/Participation');

const seedDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/feedants_competition';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Competition.deleteMany({});
    await Participation.deleteMany({});
    console.log('Cleared existing data');

    // Create test users
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
      },
      {
        name: 'Alex Kumar',
        email: 'alex@example.com',
        password: 'password123',
      },
    ]);
    console.log(`Created ${users.length} test users`);

    // Create a sample competition
    // Dates are set relative to now so the competition is always in a useful state for testing
    const now = new Date();

    const competition = await Competition.create({
      title: 'UI/UX Design Challenge 2024',
      category: 'Design',
      type: 'Individual',
      description:
        'Show off your design skills in this exciting UI/UX challenge! Create a stunning mobile app interface that solves a real-world problem. The best designs will be selected by our expert judge panel.',
      coverImage: null,
      prizePool: '₹50,000',
      entryFee: 0,
      capacity: 20,
      registeredCount: 0,

      // Registration: started 2 days ago, ends in 5 days
      registrationStart: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      registrationEnd: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),

      // Submission: starts in 6 days, ends in 15 days
      submissionStart: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
      submissionEnd: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),

      // Result: 20 days from now
      resultDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),

      judge: {
        name: 'Rahul Verma',
        title: 'Senior Design Lead at TechCorp',
        avatar: null,
      },

      judgingParameters: [
        { name: 'Creativity', weightage: 30, description: 'Originality and innovation of the design' },
        { name: 'Usability', weightage: 25, description: 'Ease of use and user experience' },
        { name: 'Visual Appeal', weightage: 25, description: 'Aesthetics and visual consistency' },
        { name: 'Problem Solving', weightage: 20, description: 'How well the design addresses the problem' },
      ],

      rules: [
        'All submissions must be original work',
        'Participants must submit before the deadline',
        'Maximum 3 screens per submission',
        'Designs must be created using standard design tools (Figma, Sketch, Adobe XD)',
        'No plagiarism — entries will be checked',
      ],

      eligibility: [
        'Open to all design enthusiasts',
        'Must be 18 years or older',
        'Individual participation only',
        'One submission per participant',
      ],

      rewards: [
        { rank: 1, title: '1st Place', prize: '₹25,000' },
        { rank: 2, title: '2nd Place', prize: '₹15,000' },
        { rank: 3, title: '3rd Place', prize: '₹10,000' },
      ],

      previousWinners: [
        { name: 'Priya Sharma', rank: 1, prize: '₹25,000', avatar: null },
        { name: 'Amit Patel', rank: 2, prize: '₹15,000', avatar: null },
        { name: 'Sara Khan', rank: 3, prize: '₹10,000', avatar: null },
      ],

      status: 'REGISTRATION_OPEN',
    });

    console.log(`Created competition: ${competition.title} (ID: ${competition._id})`);
    console.log('\n--- Seed Complete ---');
    console.log('\nTest credentials:');
    console.log('  Email: john@example.com  |  Password: password123');
    console.log('  Email: jane@example.com  |  Password: password123');
    console.log('  Email: alex@example.com  |  Password: password123');
    console.log(`\nCompetition ID: ${competition._id}`);
    console.log('\nComputed status:', competition.computeStatus());

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
