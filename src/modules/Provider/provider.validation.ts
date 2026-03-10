import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createProviderSchema = z.object({
  body: z.object({
    businessName: z.string().min(1, "Business name is required"),
    slug: z
      .string()
      .min(1, "Slug is required")
      .regex(slugRegex, "Slug must be lowercase letters, numbers and hyphens only"),
    logo: z.string().url("Logo must be a valid URL").optional(),
    banner: z.string().url("Banner must be a valid URL").optional(),
    description: z.string().optional(),
    address: z.string().min(1, "Address is required"),
    city: z.string().optional(),
    cuisineSpecialties: z.array(z.string()).optional().default([]),
  }),
});

const updateProviderSchema = z.object({
  body: z.object({
    businessName: z.string().min(1, "Business name cannot be empty").optional(),
    slug: z
      .string()
      .min(1)
      .regex(slugRegex, "Slug must be lowercase letters, numbers and hyphens only")
      .optional(),
    logo: z.string().url("Logo must be a valid URL").optional(),
    banner: z.string().url("Banner must be a valid URL").optional(),
    description: z.string().optional(),
    address: z.string().min(1, "Address cannot be empty").optional(),
    city: z.string().optional(),
    cuisineSpecialties: z.array(z.string()).optional(),
    isOpen: z.boolean().optional(),
  }),
});

const approvalSchema = z.object({
  body: z.object({
    approvalStatus: z.enum(["APPROVED", "REJECTED"], {
      message: "approvalStatus must be APPROVED or REJECTED",
    }),
  }),
});

const getProvidersQuerySchema = z.object({
  query: z
    .object({
      city: z.string().optional(),
      cuisineSpecialty: z.string().optional(),
      search: z.string().optional(),
      isOpen: z.enum(["true", "false"]).optional(),
      page: z
        .string()
        .regex(/^\d+$/, "page must be a positive integer")
        .optional(),
      limit: z
        .string()
        .regex(/^\d+$/, "limit must be a positive integer")
        .optional(),
      sortBy: z
        .enum(["businessName", "createdAt", "averageRating"])
        .optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
    })
    .optional(),
});

export const providerValidationSchema = {
  createProviderSchema,
  updateProviderSchema,
  approvalSchema,
  getProvidersQuerySchema,
};
