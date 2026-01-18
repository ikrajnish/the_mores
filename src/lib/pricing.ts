import ServicePricing from '../models/ServicePricing';
import Membership from '../models/Membership';
import mongoose from 'mongoose';
import dbConnect from './db';

/**
 * Calculates the final price for a service given a membership.
 * Logic:
 * 1. If userMembershipId is provided, look for pricing for that membership.
 * 2. If no pricing found for that membership (or no membership provided), look for NORMAL membership pricing.
 * 3. Return the price found, or throw error if not found (should always be configured).
 */
export async function calculatePrice(
  serviceId: string | mongoose.Types.ObjectId,
  userMembershipId: string | mongoose.Types.ObjectId | null
): Promise<number> {
  await dbConnect();

  let finalPrice: number | null = null;

  // 1. Try to find price for the specific membership if provided
  if (userMembershipId) {
    const membershipPricing = await ServicePricing.findOne({
      serviceId,
      membershipId: userMembershipId,
    });
    if (membershipPricing) {
      finalPrice = membershipPricing.price;
    }
  }

  // 2. If no specific price found yet, fall back to NORMAL pricing
  if (finalPrice === null) {
    // Find the NORMAL membership ID
    // Optimize: In a real app, we might cache this ID.
    const normalMembership = await Membership.findOne({ name: 'NORMAL' });
    
    if (!normalMembership) {
      throw new Error('System Configuration Error: NORMAL membership not found');
    }

    const normalPricing = await ServicePricing.findOne({
      serviceId,
      membershipId: normalMembership._id,
    });

    if (normalPricing) {
      finalPrice = normalPricing.price;
    }
  }

  if (finalPrice === null) {
    throw new Error(`Pricing not configured for service ${serviceId}`);
  }

  return finalPrice;
}
