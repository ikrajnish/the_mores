import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IServicePricing extends Document {
  serviceId: mongoose.Types.ObjectId;
  membershipId: mongoose.Types.ObjectId | null; // null for base price (or specify logic)
  price: number;
}
/*
 Pricing Logic:
 - One price per service per membership.
 - If membershipId is provided, it's the price for that membership.
 - If membershipId matches NORMAL membership (or logic), it's the standard price.
 - The requirements say "One price per service per membership".
 - Note: "If user has membership: Use ServicePricing for that membership. Else: Use NORMAL pricing."
 - So we assume there is a ServicePricing entry for 'NORMAL' membership tier as well, or we handle it.
 - User Rules: "NORMAL users have membershipId = null". 
 - But ServicePricing relates to Membership entity. Membership has 'NORMAL' entry.
 - So we should link to the 'NORMAL' Membership document for base prices.
*/

const ServicePricingSchema: Schema<IServicePricing> = new Schema(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    membershipId: {
      type: Schema.Types.ObjectId,
      ref: 'Membership',
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

// Compound unique index to ensure one price per service per membership
ServicePricingSchema.index({ serviceId: 1, membershipId: 1 }, { unique: true });

const ServicePricing: Model<IServicePricing> =
  mongoose.models.ServicePricing || mongoose.model<IServicePricing>('ServicePricing', ServicePricingSchema);

export default ServicePricing;
