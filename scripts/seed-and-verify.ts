import { loadEnvConfig } from '@next/env';
const projectDir = process.cwd();
loadEnvConfig(projectDir);

import dbConnect from '../src/lib/db';
import Membership from '../src/models/Membership';
import ServiceCategory from '../src/models/ServiceCategory';
import Service from '../src/models/Service';
import ServicePricing from '../src/models/ServicePricing';
import User from '../src/models/User';
import Booking from '../src/models/Booking';
import { calculatePrice } from '../src/lib/pricing';

async function verify() {
  console.log('Connecting to DB...');
  await dbConnect();
  console.log('Connected!');

  try {
    // Clean up
    await ServicePricing.deleteMany({});
    await Booking.deleteMany({});
    await Service.deleteMany({});
    await ServiceCategory.deleteMany({});
    await User.deleteMany({});
    await Membership.deleteMany({});

    console.log('Cleared DB.');

    // 1. Create Memberships
    console.log('Creating Memberships...');
    const normal = await Membership.create({ name: 'NORMAL' });
    const silver = await Membership.create({ name: 'SILVER' });
    const gold = await Membership.create({ name: 'GOLD' });

    // 2. Create Category
    const cat = await ServiceCategory.create({ name: 'Hair' });

    // 3. Create Service
    const service = await Service.create({
      name: 'Haircut',
      duration: 30,
      categoryId: cat._id,
    });

    // 4. Pricing
    console.log('Setting Pricing...');
    // Normal Price: 500
    await ServicePricing.create({
      serviceId: service._id,
      membershipId: normal._id,
      price: 500,
    });
    // Gold Price: 300
    await ServicePricing.create({
      serviceId: service._id,
      membershipId: gold._id,
      price: 300,
    });

    // 5. Test Pricing Logic
    console.log('Testing Pricing Engine...');
    
    // Test 1: User with no membership (should be normal)
    const price1 = await calculatePrice(service._id, null);
    console.log(`Price for no membership (Expected 500): ${price1}`);
    if (price1 !== 500) throw new Error('Pricing Logic Failed for No Membership');

    // Test 2: User with Gold membership
    const price2 = await calculatePrice(service._id, gold._id);
    console.log(`Price for Gold membership (Expected 300): ${price2}`);
    if (price2 !== 300) throw new Error('Pricing Logic Failed for Gold Membership');

    // Test 3: User with Silver membership (no explicit price, should fall back to NORMAL? Or Error?)
    // Logic said: "One price per service per membership". 
    // And "If user has membership: Use ServicePricing for that membership. Else: Use NORMAL pricing."
    // My implementation of `calculatePrice` attempts to find specific membership price first.
    // If NOT found, it falls back to NORMAL. 
    // Wait, the requirement: "One price per service per membership". This implies we SHOULD have a price for Silver.
    // If I didn't create one, my logic falls back to NORMAL. This seems like a safe default or a bug depending on strictness.
    // Let's test what happens.
    const price3 = await calculatePrice(service._id, silver._id);
    console.log(`Price for Silver membership (missing specific price, fallback to Normal -> 500): ${price3}`);
    if (price3 !== 500) throw new Error('Pricing Logic Fallback Failed');


    // 6. Create User & Booking
    console.log('Creating User and Booking...');
    const user = await User.create({ phone: '1234567890', role: 'CUSTOMER' });
    await Booking.create({
      userId: user._id,
      serviceId: service._id,
      date: new Date(),
      slot: '10:00',
      pricePaid: price1,
      membershipSnapshot: 'NORMAL',
      status: 'CREATED',
    });

    console.log('VERIFICATION SUCCESSFUL!');
  } catch (err) {
    console.error('Verification Failed:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

verify();
