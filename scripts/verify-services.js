const mongoose = require('mongoose');
const { Schema } = mongoose;

const ServiceSchema = new Schema({
  name: String,
  categoryId: Schema.Types.ObjectId,
});

const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await Service.countDocuments();
    console.log(`Total Services: ${count}`);
    const services = await Service.find().select('name');
    console.log('Services:', services.map(s => s.name));
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}
verify();
