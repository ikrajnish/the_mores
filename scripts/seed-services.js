const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define Schemas locally to avoid import issues in standalone script
const ServiceCategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
}, { timestamps: true });

const ServiceSchema = new Schema({
  name: { type: String, required: true, unique: true },
  duration: { type: Number, required: true, min: 1 },
  image: { type: String },
  shortDescription: { type: String },
  categoryId: { type: Schema.Types.ObjectId, ref: 'ServiceCategory', required: true },
}, { timestamps: true });

const MembershipSchema = new Schema({
  name: { type: String, enum: ['NORMAL', 'SILVER', 'GOLD'], required: true, unique: true, default: 'NORMAL' },
}, { timestamps: true });

const ServicePricingSchema = new Schema({
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  membershipId: { type: Schema.Types.ObjectId, ref: 'Membership', required: true },
  price: { type: Number, required: true, min: 0 },
}, { timestamps: true });

// Models
const ServiceCategory = mongoose.models.ServiceCategory || mongoose.model('ServiceCategory', ServiceCategorySchema);
const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);
const Membership = mongoose.models.Membership || mongoose.model('Membership', MembershipSchema);
const ServicePricing = mongoose.models.ServicePricing || mongoose.model('ServicePricing', ServicePricingSchema);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Create Category
    let category = await ServiceCategory.findOne({ name: 'Hair' });
    if (!category) {
      category = await ServiceCategory.create({ name: 'Hair' });
      console.log('Created Category: Hair');
    } else {
        console.log('Category Hair already exists');
    }

    // 2. Create Membership
    let membership = await Membership.findOne({ name: 'NORMAL' });
    if (!membership) {
      membership = await Membership.create({ name: 'NORMAL' });
      console.log('Created Membership: NORMAL');
    } else {
        console.log('Membership NORMAL already exists');
    }

    // 3. Create Services
    const servicesData = [
      {
        name: 'Haircut',
        duration: 30,
        image: 'https://images.unsplash.com/photo-1593702295094-aea8c5c13589?w=800&auto=format&fit=crop&q=60',
        shortDescription: 'Professional haircut service including wash and style.',
        categoryId: category._id,
        price: 500
      },
      {
        name: 'Hair Color',
        duration: 120,
        image: 'https://images.unsplash.com/photo-1620331311120-099b678138a1?w=800&auto=format&fit=crop&q=60',
        shortDescription: 'Full head hair coloring with premium products.',
        categoryId: category._id,
        price: 2500
      },
       {
        name: 'Hair Spa',
        duration: 60,
        image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&auto=format&fit=crop&q=60',
        shortDescription: 'Relaxing hair spa treatment for healthy and shiny hair.',
        categoryId: category._id,
        price: 1200
      }
    ];

    for (const sData of servicesData) {
      let service = await Service.findOne({ name: sData.name });
      if (!service) {
        service = await Service.create({
          name: sData.name,
          duration: sData.duration,
          image: sData.image,
          shortDescription: sData.shortDescription,
          categoryId: sData.categoryId,
        });
        console.log(`Created Service: ${sData.name}`);
        
        // Create Pricing
        await ServicePricing.create({
            serviceId: service._id,
            membershipId: membership._id,
            price: sData.price
        });
        console.log(`Created Pricing for: ${sData.name}`);

      } else {
          console.log(`Service ${sData.name} already exists`);
           // Check if pricing exists, if not create it
           const pricing = await ServicePricing.findOne({ serviceId: service._id, membershipId: membership._id });
           if(!pricing) {
                await ServicePricing.create({
                    serviceId: service._id,
                    membershipId: membership._id,
                    price: sData.price
                });
                console.log(`Created Pricing for: ${sData.name}`);
           }
      }
    }

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

seed();
