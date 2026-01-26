
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const mongoose = require('mongoose');
const { Schema } = mongoose;

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/themores";

// Define simpler schemas just for this script to avoid import issues
const CategorySchema = new Schema({ name: String, image: String }, { strict: false });
const SubCategorySchema = new Schema({ name: String, categoryId: Schema.Types.ObjectId, image: String }, { strict: false });

const Category = mongoose.model('ServiceCategory', CategorySchema);
const Subcategory = mongoose.model('Subcategory', SubCategorySchema);

const IMAGES = {
    // Categories
    "Hair": "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2669&auto=format&fit=crop",
    "Skin": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop",
    "Makeup": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=2071&auto=format&fit=crop",
    "Nails": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=2070&auto=format&fit=crop",
    "Spa": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop",
    "Wellness": "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070&auto=format&fit=crop",
    
    // Fallback
    "Default": "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2036&auto=format&fit=crop"
};

const SUB_IMAGES = {
    "Haircuts": "https://images.unsplash.com/photo-1593269233641-8ae296f1d2c6?q=80&w=2070&auto=format&fit=crop",
    "Coloring": "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?q=80&w=2072&auto=format&fit=crop",
    "Styling": "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2669&auto=format&fit=crop",
    "Facials": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=2070&auto=format&fit=crop",
    "Manicure": "https://images.unsplash.com/photo-1610992015732-2449b76344bc?q=80&w=2070&auto=format&fit=crop",
    "Pedicure": "https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?q=80&w=2070&auto=format&fit=crop",
    "Massage": "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=2574&auto=format&fit=crop"
};

async function updateImages() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB...");

        // Update Categories
        const categories = await Category.find({});
        console.log(`Found ${categories.length} categories.`);

        for (const cat of categories) {
            let img = IMAGES[cat.name] || IMAGES[Object.keys(IMAGES).find(k => cat.name.includes(k))] || IMAGES["Default"];
            
            // Special case matching logic
            if (cat.name.toLowerCase().includes('face') || cat.name.toLowerCase().includes('facial')) img = IMAGES['Skin'];
            if (cat.name.toLowerCase().includes('hair')) img = IMAGES['Hair'];

            if (!cat.image) {
                cat.image = img;
                await cat.save();
                console.log(`Updated Category: ${cat.name}`);
            } else {
                console.log(`Skipped Category (Has Image): ${cat.name}`);
            }
        }

        // Update Subcategories
        const subcategories = await Subcategory.find({});
        console.log(`Found ${subcategories.length} subcategories.`);

        for (const sub of subcategories) {
            let img = SUB_IMAGES[sub.name] || SUB_IMAGES[Object.keys(SUB_IMAGES).find(k => sub.name.includes(k))];
            
            if (!img) {
                // Determine generic image based on parent category if possible, or random
                img = IMAGES["Default"];
            }

            if (!sub.image) {
                sub.image = img;
                await sub.save();
                console.log(`Updated Subcategory: ${sub.name}`);
            }
        }

        console.log("Done!");
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

updateImages();
