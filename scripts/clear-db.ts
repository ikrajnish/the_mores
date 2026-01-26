import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import User from '../src/models/User';
import Booking from '../src/models/Booking';
import Membership from '../src/models/Membership';

async function clearDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connected.');

    console.log('🗑️  Deleting Users...');
    const users = await User.deleteMany({});
    console.log(`   - Deleted ${users.deletedCount} users.`);

    console.log('🗑️  Deleting Bookings...');
    const bookings = await Booking.deleteMany({});
    console.log(`   - Deleted ${bookings.deletedCount} bookings.`);

    console.log('🗑️  Deleting Memberships...');
    const memberships = await Membership.deleteMany({});
    console.log(`   - Deleted ${memberships.deletedCount} memberships.`);

    console.log('✨ Database cleanup complete.');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected.');
    process.exit(0);
  }
}

clearDatabase();
