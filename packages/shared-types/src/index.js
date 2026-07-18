import { z } from 'zod';

export const UserRoleSchema = z.enum(['superadmin', 'admin', 'teacher', 'parent', 'student']);

export const UserSchema = z.object({
  schoolId: z.string().optional(), // superadmin might not have a schoolId initially, but all others will
  role: UserRoleSchema,
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional(), // Students might not have emails
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  isActive: z.boolean().default(true),
});

export const SchoolSchema = z.object({
  name: z.string().min(2, "School name is required"),
  board: z.string().optional(),
  address: z.string().optional(),
  subscriptionPlan: z.enum(['Basic', 'Pro', 'Enterprise']).default('Basic'),
  isActive: z.boolean().default(true),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});
