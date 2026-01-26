
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable');
  process.exit(1);
}

const MembershipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ['NORMAL', 'SILVER', 'GOLD', 'PLATINUM'],
      required: true,
      unique: true,
      default: 'NORMAL',
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    description: {
      type: String,
      required: false,
    },
    benefits: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Membership = mongoose.models.Membership || mongoose.model('Membership', MembershipSchema);

async function seedMemberships() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const memberships = [
      {
        name: 'SILVER',
        price: 1099,
        description: 'Perfect for occasional indulgence.',
        benefits: [
          '1 Complementary service - Deep nourishment / Dandruff Treatment / Hairfall Treatment Hair Spa (Once a year)',
          'Eyebrows threading complementary on every D tan facial',
          '10% off on Advanced Hair Spa services',
          '10% off on services under Facial Care section',
          '10% off on basic manicure and pedicure',
          '10% off on root touch up'
        ]
      },
      {
        name: 'GOLD',
        price: 2499,
        description: 'Complete beauty care package.',
        benefits: [
          '1 complimentary O3+ Brightening Facial (Once a year)',
          '1 complimentary Haircut + Hair Wash (Once a year)',
          'Eyebrows threading complementary on every D tan facial',
          'Advanced underarms wax on any facial starting from ₹1999',
          'All Silver Subscription benefits included',
          '10% off on all services under Facial Therapy section',
          '15% off on Global Hair colour',
          '15-20% off on advanced Manicure & Pedicure',
          'Exclusive packages for festive season',
          '5% off on total billing above ₹5999'
        ]
      }
    ];

    for (const mem of memberships) {
      await Membership.findOneAndUpdate(
        { name: mem.name },
        { ...mem },
        { upsert: true, new: true }
      );
      console.log(`Updated/Created ${mem.name} membership`);
    }

    console.log('Membership seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding memberships:', error);
    process.exit(1);
  }
}

seedMemberships();
