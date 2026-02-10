export const SUBSCRIPTION_PLANS = {
  SILVER: {
    name: 'SILVER',
    benefits: [
      {
        code: 'SILVER_SPA_CHOICE',
        name: 'Complimentary Spa or Treatment',
        description: 'Deep Nourishment Hair Spa OR Dandruff Treatment OR Hairfall Treatment',
        limit: 1,
        period: 'YEARLY'
      }
    ]
  },
  GOLD: {
    name: 'GOLD',
    benefits: [
      {
        code: 'GOLD_O3_FACIAL',
        name: 'Complimentary O3+ Brightening Facial',
        description: 'One complimentary O3+ Brightening Facial per year',
        limit: 1,
        period: 'YEARLY'
      },
      {
        code: 'GOLD_HAIRCUT',
        name: 'Complimentary Haircut + Wash',
        description: 'One complimentary Haircut + Hair Wash per year',
        limit: 1,
        period: 'YEARLY'
      },
      // Inherits Silver
      {
        code: 'SILVER_SPA_CHOICE',
        name: 'Complimentary Spa or Treatment (from Silver)',
        description: 'Deep Nourishment Hair Spa OR Dandruff Treatment OR Hairfall Treatment',
        limit: 1,
        period: 'YEARLY'
      }
    ]
  }
};

export const getPlanBenefits = (planName: string) => {
  if (planName === 'SILVER') return SUBSCRIPTION_PLANS.SILVER.benefits;
  if (planName === 'GOLD') return SUBSCRIPTION_PLANS.GOLD.benefits;
  return [];
};
