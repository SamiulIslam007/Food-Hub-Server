import { z } from "zod";

const addToCartSchema = z.object({
  body: z.object({
    mealId: z.string().uuid("Invalid meal ID"),
    quantity: z
      .number()
      .int("Quantity must be a whole number")
      .min(1, "Quantity must be at least 1"),
  }),
});

const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z
      .number()
      .int("Quantity must be a whole number")
      .min(1, "Quantity must be at least 1"),
  }),
});

export const cartValidationSchema = {
  addToCartSchema,
  updateCartItemSchema,
};
