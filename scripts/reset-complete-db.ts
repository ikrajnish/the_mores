import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
// Import ALL models
import User from '../src/models/User';
import Booking from '../src/models/Booking';
import Membership from '../src/models/Membership';
import ServiceCategory from '../src/models/ServiceCategory';
import Subcategory from '../src/models/Subcategory';
import Service from '../src/models/Service';
import ServicePricing from '../src/models/ServicePricing';
import Product from '../src/models/Product';
import Gallery from '../src/models/Gallery';
import OTP from '../src/models/OTP';
import Payment from '../src/models/Payment';
import ProductRequest from '../src/models/ProductRequest';
import Transaction from '../src/models/Transaction';

async function clearFullDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connected.');

    // Helper to delete and log
    const deleteCollection = async (model: any, name: string) => {
        const res = await model.deleteMany({});
        console.log(`🗑️  Deleted ${res.deletedCount} ${name}.`);
    }

    await deleteCollection(User, 'Users');
    await deleteCollection(Booking, 'Bookings');
    await deleteCollection(Membership, 'Memberships');
    await deleteCollection(ServiceCategory, 'Categories');
    await deleteCollection(Subcategory, 'Subcategories');
    await deleteCollection(Service, 'Services');
    await deleteCollection(ServicePricing, 'Pricing');
    await deleteCollection(Product, 'Products');
    await deleteCollection(Gallery, 'Gallery Items');
    await deleteCollection(OTP, 'OTPs');
    await deleteCollection(Payment, 'Payments');
    await deleteCollection(ProductRequest, 'Product Requests');
    await deleteCollection(Transaction, 'Transactions');

    console.log('✨ FULL Database reset complete. The app is blank.');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected.');
    process.exit(0);
  }
}

clearFullDatabase();
