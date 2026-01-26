import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  phone: string;
  name?: string;
  image?: string;
  email?: string;
  role: 'ADMIN' | 'CUSTOMER';
  isBlocked: boolean;
  membershipId: mongoose.Types.ObjectId | null;
  membershipExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

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
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
