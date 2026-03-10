import { z } from "zod";
import { MealAvailabilityStatus } from "../../generated/enums";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createMealSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid("Invalid category ID"),
    title: z.string().min(1, "Title is required"),
    slug: z
      .string()
      .min(1, "Slug is required")
      .regex(slugRegex, "Slug must be lowercase letters, numbers and hyphens only"),
    shortDescription: z.string().optional(),
    description: z.string().min(1, "Description is required"),
    price: z.number().positive("Price must be a positive number"),
    image: z.string().url("Image must be a valid URL").optional(),
    availabilityStatus: z.nativeEnum(MealAvailabilityStatus).optional(),
    stockQuantity: z.number().int().min(0, "Stock quantity cannot be negative").optional(),
    spiceLevel: z.string().optional(),
    dietaryTags: z.array(z.string()).optional().default([]),
    preparationTime: z
      .number()
      .int()
      .positive("Preparation time must be positive")
      .optional(),
    featured: z.boolean().optional(),
  }),
});

const updateMealSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid("Invalid category ID").optional(),
    title: z.string().min(1, "Title cannot be empty").optional(),
    slug: z
      .string()
      .min(1)
      .regex(slugRegex, "Slug must be lowercase letters, numbers and hyphens only")
      .optional(),
    shortDescription: z.string().optional(),
    description: z.string().min(1, "Description cannot be empty").optional(),
    price: z.number().positive("Price must be a positive number").optional(),
    image: z.string().url("Image must be a valid URL").optional(),
    availabilityStatus: z.nativeEnum(MealAvailabilityStatus).optional(),
    stockQuantity: z.number().int().min(0).optional(),
    spiceLevel: z.string().optional(),
    dietaryTags: z.array(z.string()).optional(),
    preparationTime: z.number().int().positive().optional(),
    featured: z.boolean().optional(),
  }),
});

const getMealsQuerySchema = z.object({
  query: z
    .object({
      categoryId: z.string().optional(),
      providerProfileId: z.string().optional(),
      minPrice: z
        .string()
        .regex(/^\d+(\.\d+)?$/, "minPrice must be a valid number")
        .optional(),
      maxPrice: z
        .string()
        .regex(/^\d+(\.\d+)?$/, "maxPrice must be a valid number")
        .optional(),
      dietaryTags: z.string().optional(),
      featured: z.enum(["true", "false"]).optional(),
      availabilityStatus: z.nativeEnum(MealAvailabilityStatus).optional(),
      search: z.string().optional(),
      page: z
        .string()
        .regex(/^\d+$/, "page must be a positive integer")
        .optional(),
      limit: z
        .string()
        .regex(/^\d+$/, "limit must be a positive integer")
        .optional(),
      sortBy: z.enum(["price", "createdAt", "title"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
    })
    .optional(),
});

export const mealValidationSchema = {
  createMealSchema,
  updateMealSchema,
  getMealsQuerySchema,
};
