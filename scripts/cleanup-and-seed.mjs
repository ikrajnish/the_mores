
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable');
  process.exit(1);
}

// Minimal Schemas
const CatSchema = new mongoose.Schema({ name: String });
const SubCatSchema = new mongoose.Schema({ name: String, categoryId: mongoose.Schema.Types.ObjectId });
const ServSchema = new mongoose.Schema({ 
    name: String, 
    categoryId: mongoose.Schema.Types.ObjectId, 
    subcategory: mongoose.Schema.Types.ObjectId,
    duration: Number,
    price: Number 
});

const Cat = mongoose.models.ServiceCategory || mongoose.model('ServiceCategory', CatSchema);
const Sub = mongoose.models.Subcategory || mongoose.model('Subcategory', SubCatSchema);
const Serv = mongoose.models.Service || mongoose.model('Service', ServSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB.');

    // 1. Cleanup "test" data
    console.log('\n--- Cleaning up "test" data ---');
    const testCats = await Cat.find({ name: { $regex: /test/i } });
    for (const c of testCats) {
        console.log(`Deleting Category: ${c.name}`);
        // Delete related
        await Sub.deleteMany({ categoryId: c._id });
        await Serv.deleteMany({ categoryId: c._id });
        await Cat.findByIdAndDelete(c._id);
    }

    const testSubs = await Sub.find({ name: { $regex: /test/i } });
    for (const s of testSubs) {
        console.log(`Deleting Subcategory: ${s.name}`);
        await Serv.deleteMany({ subcategory: s._id });
        await Sub.findByIdAndDelete(s._id);
    }
    
    // 2. Ensure Hair Hierarchy
    console.log('\n--- Verifying/Seeding Hair Hierarchy ---');
    
    // Category: Hair
    let hairCat = await Cat.findOne({ name: 'Hair' });
    if (!hairCat) {
        console.log('Creating "Hair" Category...');
        hairCat = await Cat.create({ name: 'Hair' });
    } else {
        console.log('"Hair" Category exists.');
    }

    // Subcategory: Haircare & Styling
    let styleSub = await Sub.findOne({ name: 'Haircare & Styling', categoryId: hairCat._id });
    if (!styleSub) {
        console.log('Creating "Haircare & Styling" Subcategory...');
        styleSub = await Sub.create({ name: 'Haircare & Styling', categoryId: hairCat._id });
    } else {
         console.log('"Haircare & Styling" Subcategory exists.');
    }

    // Service: Basic Haircut
    let cutService = await Serv.findOne({ name: 'Basic Haircut', subcategory: styleSub._id });
    if (!cutService) {
        console.log('Creating "Basic Haircut" Service...');
        cutService = await Serv.create({ 
            name: 'Basic Haircut', 
            categoryId: hairCat._id, 
            subcategory: styleSub._id,
            duration: 30,
            price: 500 // Placeholder, pricing model handles real price usually
        });
    } else {
        console.log('"Basic Haircut" Service exists.');
    }

    console.log('\nDone.');
    process.exit(0);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
