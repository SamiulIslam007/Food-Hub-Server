import { z } from "zod";

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please provide a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["CUSTOMER", "PROVIDER"]).optional(),
    phone: z.string().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Please provide a valid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const authValidationSchema = {
  registerSchema,
  loginSchema,
};
