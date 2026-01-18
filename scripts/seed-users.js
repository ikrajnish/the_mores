const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Define User Schema (Simplified version required for script)
const UserSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    role: { type: String, enum: ['ADMIN', 'CUSTOMER'], default: 'CUSTOMER' },
    membershipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership', default: null },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedUsers() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = [
      {
        phone: '9999999999', // Admin User
        role: 'ADMIN',
      },
      {
        phone: '8888888888', // Tester User
        role: 'CUSTOMER',
      }
    ];

    for (const u of users) {
        // Check if user exists
        const existing = await User.findOne({ phone: u.phone });
        if (existing) {
            console.log(`User ${u.phone} already exists. Updating role...`);
            existing.role = u.role;
            await existing.save();
        } else {
            await User.create(u);
            console.log(`Created user ${u.phone} with role ${u.role}`);
        }
    }
    
    console.log('User seeding completed!');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedUsers();
