import { z } from "zod";

/**
 * Common validation schemas using Zod
 */

// Email validation
export const emailSchema = z
  .string()
  .email("Please enter a valid email address");

// Mobile validation (E.164 format: + followed by country code and subscriber number)
export const mobileSchema = z
  .string()
  .regex(
    /^\+[1-9]\d{6,14}$/,
    "Mobile number must be in international format (e.g. +905551234567)",
  );

// Password validation (min 8 chars, at least one letter and one number)
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Name validation
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters");

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Registration form schema
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    fullname: nameSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Profile update schema
export const profileSchema = z.object({
  fullname: nameSchema.optional(),
  email: emailSchema.optional(),
  avatar: z.string().url().optional().or(z.literal("")),
});

// Password change schema
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Verification code schema
export const verificationCodeSchema = z.object({
  code: z.string().min(4, "Code must be at least 4 characters"),
});
