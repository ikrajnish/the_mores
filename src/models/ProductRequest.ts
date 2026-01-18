import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductRequest extends Document {
  productId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // Optional if user is not logged in
  userPhone: string;
  status: 'PENDING' | 'FULFILLED';
  createdAt: Date;
  updatedAt: Date;
}

const ProductRequestSchema: Schema<IProductRequest> = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    userPhone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'FULFILLED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

const ProductRequest: Model<IProductRequest> =
  mongoose.models.ProductRequest || mongoose.model<IProductRequest>('ProductRequest', ProductRequestSchema);

export default ProductRequest;
