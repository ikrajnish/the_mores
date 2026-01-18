import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IService extends Document {
  name: string;
  duration: number; // in minutes
  categoryId: mongoose.Types.ObjectId;
  image?: string;
  shortDescription?: string;
}

const ServiceSchema: Schema<IService> = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    image: {
      type: String,
      required: false,
    },
    shortDescription: {
      type: String,
      required: false,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      required: true,
    },
  },
  { timestamps: true }
);

const Service: Model<IService> =
  mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);

export default Service;
