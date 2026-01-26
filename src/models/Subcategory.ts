import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubcategory extends Document {
  name: string;
  categoryId: mongoose.Types.ObjectId;
  image?: string;
}

const SubcategorySchema: Schema<ISubcategory> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      required: true,
    },
    image: {
      type: String, // URL to the image
      required: false,
    },
  },
  { timestamps: true }
);

// Compound index to ensure unique subcategory names per category
SubcategorySchema.index({ name: 1, categoryId: 1 }, { unique: true });

const Subcategory: Model<ISubcategory> =
  mongoose.models.Subcategory || mongoose.model<ISubcategory>('Subcategory', SubcategorySchema);

export default Subcategory;
