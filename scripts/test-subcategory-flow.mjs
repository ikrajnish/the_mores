import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testSubcategory() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing');

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    
    // 1. Find a service
    const service = await db.collection('services').findOne({});
    if (!service) {
        console.log("No services found to test with.");
        return;
    }
    
    console.log(`Testing with service: ${service.name} (ID: ${service._id})`);
    
    // 2. Assign a subcategory
    const testSub = "Test-Sub-Category";
    await db.collection('services').updateOne(
        { _id: service._id },
        { $set: { subcategory: testSub } }
    );
    console.log(`Updated service '${service.name}' with subcategory '${testSub}'`);

    // 3. Simulate Category Page: Get distinct subcategories
    const servicesInCat = await db.collection('services').find({ categoryId: service.categoryId }).toArray();
    const subcategories = [...new Set(servicesInCat.map(s => s.subcategory).filter(Boolean))];
    console.log(`[Category Page] Subcategories found:`, subcategories);
    
    if (!subcategories.includes(testSub)) {
        console.error("FAIL: Test subcategory not found in distinct list!");
    } else {
        console.log("PASS: Subcategory listed correctly.");
    }

    // 4. Simulate Subcategory Page: Get services for subcategory
    const filteredServices = await db.collection('services').find({ 
        categoryId: service.categoryId,
        subcategory: testSub 
    }).toArray();
    
    console.log(`[Subcategory Page] Services found for '${testSub}':`, filteredServices.map(s => s.name));
    
    if (filteredServices.some(s => s._id.toString() === service._id.toString())) {
        console.log("PASS: Service found in subcategory query.");
    } else {
        console.error("FAIL: Service missing from subcategory query!");
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

testSubcategory();
