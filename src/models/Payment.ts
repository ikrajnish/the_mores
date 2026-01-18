import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
  bookingId: mongoose.Types.ObjectId | null; 
  membershipId: mongoose.Types.ObjectId | null; // If paying for membership
  amount: number;
  provider: 'Razorpay';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  transactionRef: string; // Razorpay Payment ID / Order ID
  createdAt: Date;
}

const PaymentSchema: Schema<IPayment> = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    membershipId: {
      type: Schema.Types.ObjectId,
      ref: 'Membership',
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    provider: {
      type: String,
      enum: ['Razorpay'],
      default: 'Razorpay',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
    },
    transactionRef: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
