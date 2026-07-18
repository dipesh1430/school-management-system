const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const seedSuperAdmin = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school-saas';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to database.');

    const superadminEmail = process.env.SUPERADMIN_EMAIL || 'admin@schoolsaas.com';
    const superadminPassword = process.env.SUPERADMIN_PASSWORD || 'superadmin123';

    // Check if one already exists
    const existing = await User.findOne({ email: superadminEmail });
    if (existing) {
      console.log('Superadmin already exists. Skipping seed.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(superadminPassword, salt);

    const superAdmin = new User({
      name: 'System Admin',
      email: superadminEmail,
      passwordHash,
      role: 'superadmin',
      isActive: true,
      // Note: no schoolId is provided since superadmin manages all schools
    });

    await superAdmin.save();
    console.log(`Superadmin created successfully with email: ${superadminEmail}`);
    process.exit(0);

  } catch (error) {
    console.error('Error seeding superadmin:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
