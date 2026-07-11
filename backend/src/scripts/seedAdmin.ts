import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/user'; 

dotenv.config();

const seedAdmin = async () => {
  try {
    const dbURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dunia';
    await mongoose.connect(dbURI);
    console.log('Connected to database for seeding...');

    const adminEmail = 'admin@dunia.com';
    const adminPassword = 'adminDunia2026!';

    // Find the user by email
    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      // 1. If user doesn't exist, create a fresh admin
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      adminUser = new User({
        name: 'Dunia Admin',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        phone: '0550000000',
        customerProfile: {
          skinType: 'Normal',
          skinConcerns: [],
          hairType: 'Normal',
          allergies: []
        }
      });

      await adminUser.save();
      console.log(`Admin account successfully created!`);
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
    } else if (adminUser.role !== 'ADMIN') {
      // 2. Safety upgrade
      adminUser.role = 'ADMIN';
      await adminUser.save();
      console.log('Security Update: Existing customer upgraded to ADMIN role!');
    } else {
      console.log('Admin account already exists with correct privileges. Seeding skipped.');
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedAdmin();