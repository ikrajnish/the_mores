
// ----------------------------------------------------------------------
// Shared Data Transfer Objects (DTOs)
// ----------------------------------------------------------------------

export type UserRole = 'ADMIN' | 'CUSTOMER';
export type BookingStatus = 'CREATED' | 'CONFIRMED' | 'PAYMENT_PENDING' | 'COMPLETED' | 'CANCELLED';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  image?: string;
  membershipId?: string; // ID reference
  membershipName?: string; // Derived for UI
  membershipExpiresAt?: string; // ISO Date
  benefitsUsage?: BenefitUsageDTO[]; 
  createdAt?: string;
}

export interface BenefitUsageDTO {
  benefitCode: string;
  isConsumed: boolean;
  consumedAt?: string;
  notes?: string;
}

export interface ServiceDTO {
  _id: string;
  name: string;
  duration: number; // minutes
  price?: number; // Base price or derived price
  image?: string;
  categoryId?: string | ServiceCategoryDTO;
  shortDescription?: string;
  subcategory?: string; 
}

export interface ServiceCategoryDTO {
  _id: string;
  name: string;
  image?: string;
}

export interface BookingDTO {
  _id: string;
  userId: string | UserDTO;
  serviceId: string | ServiceDTO;
  date: string; // ISO Date
  slot: string;
  status: BookingStatus;
  pricePaid: number;
  membershipSnapshot?: string;
  originalPrice?: number; // For admin analytics/UI
  createdAt: string;
}

export interface MembershipDTO {
  _id: string;
  name: string;
  price: number;
  durationMonths: number;
  benefits: string[];
}

export interface AnalyticsMetricsDTO {
  totalRevenue: number;
  todaysAppointments: number;
  membershipCounts: Record<string, number>;
  activeMembers: number;
  recentEnrollments: number;
  lowStockCount: number;
}

export interface AnalyticsResponseDTO {
  metrics: AnalyticsMetricsDTO;
  recentActivity: BookingDTO[];
  revenueChart: { _id: string; revenue: number }[];
}

export interface AvailabilityResponseDTO {
  bookedSlots: string[];
}

export interface ApiErrorDTO {
  error: string;
  message?: string;
  code?: string;
}
