import { z } from "zod";

export const loginSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  photo: z.string().url().optional().or(z.literal("")).nullable(),
});

export const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  categoryId: z.string().min(1, "Category is required"),
  subcategory: z.string().optional().nullable(),
  image: z.string().url().optional().or(z.literal("")),
  shortDescription: z.string().optional(),
  pricing: z.array(z.object({
      membershipId: z.string(),
      price: z.number().min(0)
  })).optional()
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
