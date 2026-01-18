import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOTP extends Document {
  phone: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
}

const OTPSchema: Schema<IOTP> = new Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true, // One active OTP per phone usually, or just index it
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '0s' }, // Auto-delete after expiry
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const OTP: Model<IOTP> =
  mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);

export default OTP;
