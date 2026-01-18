import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGallery extends Document {
  mediaUrl: string;
  type: 'image' | 'video';
}

const GallerySchema: Schema<IGallery> = new Schema(
  {
    mediaUrl: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true,
    },
  },
  { timestamps: true }
);

const Gallery: Model<IGallery> =
  mongoose.models.Gallery || mongoose.model<IGallery>('Gallery', GallerySchema);

export default Gallery;
