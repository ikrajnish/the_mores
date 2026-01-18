import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  date: Date;
  slot: string; // e.g., "10:00"
  pricePaid: number; // Snapshot of price at booking time
  membershipSnapshot: string | null; // Name of membership at time of booking
  status: 'CREATED' | 'PAYMENT_PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema<IBooking> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    slot: {
      type: String,
      required: true,
    },
    pricePaid: {
      type: Number,
      required: true,
    },
    membershipSnapshot: {
      type: String, // Storing the name (e.g., 'GOLD') to preserve history even if ID changes logic
      default: null,
    },
    status: {
      type: String,
      enum: ['CREATED', 'PAYMENT_PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
      default: 'CREATED',
    },
  },
  { timestamps: true }
);

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
