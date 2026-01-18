const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Define Product Schema
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: false },
    description: { type: String, required: false },
    brand: { type: String, required: false },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function seedProducts() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    const products = [
      {
        name: "Kerastase Elixir Ultime",
        price: 3200,
        stock: 10,
        brand: "Kerastase",
        description: "Versatile beautifying oil for all hair types. Provides shine, softness, and nourishment.",
        image: "https://images.unsplash.com/photo-1629198789647-7973c9fdec92?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "L'Oreal Professional Mythic Oil",
        price: 1800,
        stock: 15,
        brand: "L'Oreal",
        description: "Nourishing oil for all hair types. Inspired by oriental traditions.",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Olaplex No. 3 Hair Perfector",
        price: 2950,
        stock: 8,
        brand: "Olaplex",
        description: "A concentrated treatment that strengthens the hair from within, reducing breakage and improving look and feel.",
        image: "https://images.unsplash.com/photo-1608248596639-563b272714a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Moroccanoil Treatment",
        price: 3800,
        stock: 5,
        brand: "Moroccanoil",
        description: "The original foundation for hairstyling, can be used as a conditioning, styling and finishing tool.",
        image: "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Dyson Supersonic Hair Dryer",
        price: 34900,
        stock: 2,
        brand: "Dyson",
        description: "Fast drying with no extreme heat. Engineered for different hair types.",
        image: "https://images.unsplash.com/photo-1522338140262-f46f5913618a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      }
    ];

    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);

  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedProducts();
