import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import ServiceCategory from '../src/models/ServiceCategory';
import Service from '../src/models/Service';
import ServicePricing from '../src/models/ServicePricing';
import Membership from '../src/models/Membership';

const BRIDAL_PACKAGES = [
  { name: "Bridal Care Basics", price: 6299, duration: 180 },
  { name: "Signature Bridal Glow", price: 12999, duration: 240 },
  { name: "Bridal Glow Rituals", price: 22999, duration: 300 },
  { name: "Signature Bridal Rituals", price: 29999, duration: 360 }
];

async function seedBridalPackages() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI missing');

  try {
    console.log('🔌 Connecting...');
    await mongoose.connect(uri);

    // 1. Get/Create Category
    let category = await ServiceCategory.findOne({ name: /^Bridal/i });
    if (!category) {
        // Corrected: Removed 'description' as it does not exist in ServiceCategory schema
        category = await ServiceCategory.create({ 
            name: "Bridal Packages"
        });
        console.log('   > Created "Bridal Packages" Category.');
    } else {
        console.log(`   > Found Category: ${category.name}`);
    }

    // 2. Get NORMAL Membership
    const normalMem = await Membership.findOne({ name: 'NORMAL' });
    if (!normalMem) throw new Error("NORMAL Membership not found. Run seed-specific-memberships.ts first.");

    // 3. Upsert Services
    for (const pkg of BRIDAL_PACKAGES) {
        // Upsert Service
        let service = await Service.findOne({ name: pkg.name });
        if (service) {
            service.duration = pkg.duration;
            service.categoryId = category._id as mongoose.Types.ObjectId;
            await service.save();
            console.log(`   > Updated Service: ${pkg.name}`);
        } else {
            service = await Service.create({
                name: pkg.name,
                duration: pkg.duration,
                categoryId: category._id
            });
            console.log(`   > Created Service: ${pkg.name}`);
        }

        // Upsert Pricing
        const pricing = await ServicePricing.findOneAndUpdate(
            { serviceId: service._id, membershipId: normalMem._id },
            { price: pkg.price },
            { upsert: true, new: true }
        );
        console.log(`     - Price set to ₹${pricing.price}`);
    }

    console.log('✅ Bridal Packages Seeded Successfully!');

  } catch (error) {
    console.error('Seed Failed:', error);
  } finally {
    process.exit(0);
  }
}

seedBridalPackages();
