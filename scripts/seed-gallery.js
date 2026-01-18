const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Define Gallery Schema
const GallerySchema = new mongoose.Schema(
  {
    mediaUrl: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
  },
  { timestamps: true }
);

const Gallery = mongoose.models.Gallery || mongoose.model('Gallery', GallerySchema);

async function seedGallery() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing gallery items
    await Gallery.deleteMany({});
    console.log('Cleared existing gallery items');

    const galleryItems = [
      {
        mediaUrl: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        type: "image"
      },
      {
        mediaUrl: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        type: "image"
      },
      {
        mediaUrl: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        type: "image"
      },
      {
        mediaUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        type: "image"
      },
       {
        mediaUrl: "https://images.unsplash.com/photo-1521590832169-d7fcbe313d28?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        type: "image"
      },
       {
        mediaUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        type: "image"
      },
       {
        mediaUrl: "https://images.unsplash.com/photo-1487412947132-75c5b528d263?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        type: "image"
      },
       {
        mediaUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        type: "image"
      }
    ];

    await Gallery.insertMany(galleryItems);
    console.log(`Seeded ${galleryItems.length} gallery items`);

  } catch (error) {
    console.error('Error seeding gallery:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedGallery();
