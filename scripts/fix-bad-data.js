const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

const ServiceSchema = new mongoose.Schema({
  name: String,
  subcategory: mongoose.Schema.Types.Mixed // Use Mixed to catch strings so we can query them
}, { strict: false });

const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);

async function fixData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find services where subcategory is a string
    // Note: In MongoDB, type 2 is String. $type: 2
    const badServices = await Service.find({ subcategory: { $type: 2 } }); 

    console.log(`Found ${badServices.length} services with invalid subcategory (string type).`);

    for (const service of badServices) {
        console.log(`Fixing service: ${service.name}, Bad Value: ${service.subcategory}`);
        // Set subcategory to null or remove the field
        await Service.updateOne({ _id: service._id }, { $unset: { subcategory: "" } });
        console.log(`Updated ${service.name}`);
    }

    console.log('Cleanup complete.');
    process.exit(0);

  } catch (error) {
    console.error('Error fixing data:', error);
    process.exit(1);
  }
}

fixData();
