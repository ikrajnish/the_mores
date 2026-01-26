import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IServiceCategory extends Document {
  name: string;
  image?: string;
}

const ServiceCategorySchema: Schema<IServiceCategory> = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String, // URL to the image
      required: false,
    },
  },
  { timestamps: true }
);

const ServiceCategory: Model<IServiceCategory> =
  mongoose.models.ServiceCategory || mongoose.model<IServiceCategory>('ServiceCategory', ServiceCategorySchema);

export default ServiceCategory;
