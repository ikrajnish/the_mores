import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  type: 'MEMBERSHIP' | 'EXPENSE' | 'SERVICE' | 'PRODUCT';
  amount: number;
  description: string;
  date: Date;
  userId?: mongoose.Types.ObjectId; // For membership/service link
  referenceId?: mongoose.Types.ObjectId; // Link to Booking or ProductRequest if needed
}

const TransactionSchema: Schema<ITransaction> = new Schema(
  {
    type: {
      type: String,
      enum: ['MEMBERSHIP', 'EXPENSE', 'SERVICE', 'PRODUCT'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      required: false,
    }
  },
  { timestamps: true }
);

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
