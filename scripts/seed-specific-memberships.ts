import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import Membership from '../src/models/Membership';

const MEMBERSHIPS = [
  {
    name: 'SILVER',
    price: 1099,
    period: '/ year',
    description: 'Perfect for establishing your premium routine.',
    benefits: [
        "1 Complementary service - Deep nourishment / Dandruff Treatment / Hairfall Treatment Hair Spa (Once a year)",
        "Eyebrows threading complementary on every D tan facial",
        "10% off on Advanced Hair Spa services",
        "10% off on services under Facial Care section",
        "10% off on basic manicure and pedicure",
        "10% off on root touch up"
    ]
  },
  {
    name: 'GOLD',
    price: 2499,
    period: '/ year',
    description: 'The ultimate enterprise-level luxury experience.',
    benefits: [
        "1 complimentary O3+ Brightening Facial (Once a year)",
        "1 complimentary Haircut + Hair Wash (Once a year)",
        "Eyebrows threading complementary on every D tan facial",
        "Advanced underarms wax on any facial starting from ₹1999",
        "All Silver Subscription benefits included",
        "10% off on all services under Facial Therapy section",
        "15% off on Global Hair colour",
        "15-20% off on advanced Manicure & Pedicure",
        "Exclusive packages for festive season",
        "5% off on total billing above ₹5999"
    ]
  }
];

async function seedMemberships() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI missing');

  try {
    console.log('🔌 Connecting...');
    await mongoose.connect(uri);

    console.log('🧹 Clearing Old Memberships...');
    // We only want to Replace Silver and Gold. We might want to keep "NORMAL" if it exists for base pricing logic.
    await Membership.deleteMany({ name: { $in: ['SILVER', 'GOLD'] } });

    console.log('👑 Creating New Memberships...');
    
    for (const mem of MEMBERSHIPS) {
        await Membership.create({
            name: mem.name,
            price: mem.price,
            description: mem.description,
            benefits: mem.benefits,
            durationInDays: 365 // Default 1 year
        });
        console.log(`   > Created ${mem.name} Membership at ₹${mem.price}`);
    }

    // Ensure NORMAL exists for fallback logic (safety check)
    const normal = await Membership.findOne({ name: 'NORMAL' });
    if (!normal) {
        await Membership.create({ name: 'NORMAL', price: 0, benefits: [] });
        console.log('   > Created NORMAL Membership (System Fallback)');
    }

    console.log('✅ Membership Update Complete!');
  } catch (error) {
    console.error('Seed Failed:', error);
  } finally {
    process.exit(0);
  }
}

seedMemberships();
