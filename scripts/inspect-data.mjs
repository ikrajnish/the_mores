
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ServiceCategory from '../src/models/ServiceCategory.ts';
import Subcategory from '../src/models/Subcategory.ts';
import Service from '../src/models/Service.ts';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable');
  process.exit(1);
}

// Need to define models if not using ts-node with full project context, 
// but since we are importing from src/models which might refer to mongoose.models, 
// we rely on the imports. 
// However, standard node execution of .ts files isn't simple without compilation or ts-node.
// I'll stick to defining schemas here for the script to be standalone and safe, 
// OR I will read the DB using raw mongoose calls if I don't want to duplicate schema code.
// Actually, let's just use the models if we can run this with a tool that supports it, 
// but `run_command` usually uses standard node. 
// Safest is to define minimal schemas here for inspection.

const CatSchema = new mongoose.Schema({ name: String });
const SubCatSchema = new mongoose.Schema({ name: String, categoryId: mongoose.Schema.Types.ObjectId });
const ServSchema = new mongoose.Schema({ name: String, categoryId: mongoose.Schema.Types.ObjectId, subcategory: mongoose.Schema.Types.ObjectId });

const Cat = mongoose.models.ServiceCategory || mongoose.model('ServiceCategory', CatSchema);
const Sub = mongoose.models.Subcategory || mongoose.model('Subcategory', SubCatSchema);
const Serv = mongoose.models.Service || mongoose.model('Service', ServSchema);

async function inspect() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const categories = await Cat.find({});
    console.log('\n--- Categories ---');
    categories.forEach(c => console.log(`${c._id}: ${c.name}`));

    const subcategories = await Sub.find({});
    console.log('\n--- Subcategories ---');
    subcategories.forEach(s => console.log(`${s._id}: ${s.name} (Cat: ${s.categoryId})`));

    const services = await Serv.find({});
    console.log('\n--- Services ---');
    services.forEach(s => console.log(`${s._id}: ${s.name} (Cat: ${s.categoryId}, Sub: ${s.subcategory})`));

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

inspect();
