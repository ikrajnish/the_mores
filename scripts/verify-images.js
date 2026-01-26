
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const { Schema } = mongoose;

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/themores";

const CategorySchema = new Schema({ name: String, image: String }, { strict: false });
const Category = mongoose.model('ServiceCategory', CategorySchema);

async function verify() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected...");
        
        const categories = await Category.find({}, 'name image');
        console.log("Categories found:", categories.length);
        categories.forEach(c => {
             console.log(`- ${c.name}: ${c.image ? "HAS IMAGE" : "NO IMAGE"} (${c.image?.substring(0, 30)}...)`);
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

verify();
