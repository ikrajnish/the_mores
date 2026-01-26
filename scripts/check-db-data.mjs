import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function checkData() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected successfully.');

    const db = client.db(); // Uses the default DB from connection string

    const categoriesCount = await db.collection('servicecategories').countDocuments();
    const servicesCount = await db.collection('services').countDocuments();
    const membershipsCount = await db.collection('memberships').countDocuments();
    const pricingCount = await db.collection('servicepricings').countDocuments();

    console.log('--- Database Status ---');
    console.log(`Service Categories: ${categoriesCount}`);
    console.log(`Services:           ${servicesCount}`);
    console.log(`Memberships:        ${membershipsCount}`);
    console.log(`Service Pricings:   ${pricingCount}`);
    
    // Check for 'NORMAL' membership
    const normalMembership = await db.collection('memberships').findOne({ name: 'NORMAL' });
    if (normalMembership) {
        console.log("['NORMAL' Membership]: FOUND");
    } else {
        console.log("['NORMAL' Membership]: MISSING (Critical for pricing)");
    }

  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await client.close();
  }
}

checkData();
