import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBenefitUsage {
  benefitCode: string;
  isConsumed: boolean;
  consumedAt?: Date;
  consumedByAdminId?: mongoose.Types.ObjectId;
  notes?: string; // e.g. "Used for Dandruff Treatment"
}

export interface IUser extends Document {
  phone?: string;
  name?: string;
  image?: string;
  email?: string;
  role: 'ADMIN' | 'CUSTOMER';
  isBlocked: boolean;
  membershipId: mongoose.Types.ObjectId | null;
  membershipExpiresAt?: Date | null;
  benefitsUsage: IBenefitUsage[];
  createdAt: Date;
  updatedAt: Date;
}

const BenefitUsageSchema = new Schema({
    benefitCode: { type: String, required: true },
    isConsumed: { type: Boolean, default: false },
    consumedAt: { type: Date },
    consumedByAdminId: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String }
}, { _id: false });

const UserSchema: Schema<IUser> = new Schema(
  {
    phone: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'CUSTOMER'],
      default: 'CUSTOMER',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    membershipId: {
      type: Schema.Types.ObjectId,
      ref: 'Membership',
      default: null,
    },
    membershipExpiresAt: {
      type: Date,
      default: null,
    },
    benefitsUsage: {
        type: [BenefitUsageSchema],
        default: []
    }
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
