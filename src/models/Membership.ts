import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMembership extends Document {
  name: 'NORMAL' | 'SILVER' | 'GOLD';
}

const MembershipSchema: Schema<IMembership> = new Schema(
  {
    name: {
      type: String,
      enum: ['NORMAL', 'SILVER', 'GOLD'],
      required: true,
      unique: true,
      default: 'NORMAL',
    },
  },
  { timestamps: true }
);

const Membership: Model<IMembership> =
  mongoose.models.Membership || mongoose.model<IMembership>('Membership', MembershipSchema);

export default Membership;
