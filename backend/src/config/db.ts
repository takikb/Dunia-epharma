import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/user';

const autoSeedAdmin = async () => {
  try {
    const adminEmail = 'admin@dunia.com';
    const defaultPassword = 'adminDunia2026!';

    // Find user by email
    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      // 1. If user doesn't exist, create a fresh admin
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(defaultPassword, salt);

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
      console.log('Default Admin auto-seeded successfully!');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${defaultPassword}`);
    } else if (adminUser.role !== 'ADMIN') {
      // 2. Safety: If user exists but is currently a customer, automatically upgrade them to ADMIN
      adminUser.role = 'ADMIN';
      await adminUser.save();
      console.log('Security Update: Existing customer upgraded to ADMIN role!');
    } else {
      console.log('Default Admin is already present with correct privileges.');
    }
  } catch (error) {
    console.error('Auto-seeding default admin failed:', error);
  }
};

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dunia';
    const conn = await mongoose.connect(dbURI);
    console.log(`Database Connected: ${conn.connection.host}`);
    
    // Auto-run seeding function immediately after database connects
    await autoSeedAdmin();
  } catch (error) {
    console.error(`Error connecting to MongoDB:`, error);
    process.exit(1);
  }
};

export default connectDB;