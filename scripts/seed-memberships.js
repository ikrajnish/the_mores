const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Define Membership Schema (Simplified)
const MembershipSchema = new mongoose.Schema(
  {
    name: { type: String, enum: ['NORMAL', 'SILVER', 'GOLD', 'PLATINUM'], required: true, unique: true },
    price: { type: Number, required: true, default: 0 },
    description: { type: String },
    benefits: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Membership = mongoose.models.Membership || mongoose.model('Membership', MembershipSchema);

async function seedMemberships() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const memberships = [
      {
        name: 'NORMAL',
        price: 0,
        description: 'Standard access to all services.',
        benefits: ['Access to all services', 'Standard booking']
      },
      {
        name: 'SILVER',
        price: 999,
        description: 'Perfect for regular visitors.',
        benefits: ['10% off on all services', 'Priority booking', 'Free consultation']
      },
      {
        name: 'GOLD',
        price: 1999,
        description: 'Premium experience with exclusive perks.',
        benefits: ['20% off on all services', 'VIP Lounge access', 'Complimentary beverage', 'Priority booking']
      },
      {
        name: 'PLATINUM',
        price: 4999,
        description: 'The ultimate luxury experience.',
        benefits: ['30% off on all services', 'All Gold benefits', 'Personal stylist', 'Free home service visits', 'Dedicated support']
      }
    ];

    for (const m of memberships) {
      // Upsert to preserve existing IDs if possible, or just overwrite
      await Membership.findOneAndUpdate(
        { name: m.name },
        m,
        { upsert: true, new: true }
      );
    }
    
    console.log('Seeded memberships');

  } catch (error) {
    console.error('Error seeding memberships:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedMemberships();
