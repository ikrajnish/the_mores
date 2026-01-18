import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMembership extends Document {
  name: 'NORMAL' | 'SILVER' | 'GOLD' | 'PLATINUM';
  price: number;
  description: string;
  benefits: string[];
}

const MembershipSchema: Schema<IMembership> = new Schema(
  {
    name: {
      type: String,
      enum: ['NORMAL', 'SILVER', 'GOLD', 'PLATINUM'],
      required: true,
      unique: true,
      default: 'NORMAL',
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    description: {
      type: String,
      required: false,
    },
    benefits: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Membership: Model<IMembership> =
  mongoose.models.Membership || mongoose.model<IMembership>('Membership', MembershipSchema);

export default Membership;
