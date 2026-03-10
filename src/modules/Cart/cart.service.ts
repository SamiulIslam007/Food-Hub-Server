import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { TAddToCartPayload, TUpdateCartItemPayload } from "./cart.interface";
import {
  MealAvailabilityStatus,
  ProviderApprovalStatus,
} from "../../generated/enums";

const getCart = async (userId: string) => {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      meal: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          image: true,
          availabilityStatus: true,
          stockQuantity: true,
          dietaryTags: true,
          preparationTime: true,
          providerProfile: {
            select: {
              id: true,
              businessName: true,
              slug: true,
              isOpen: true,
            },
          },
        },
      },
    },
  });

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + Number(item.meal.price) * item.quantity,
    0
  );

  return {
    items,
    summary: {
      totalItems: items.length,
      totalQuantity,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
    },
  };
};

const addToCart = async (userId: string, payload: TAddToCartPayload) => {
  const meal = await prisma.meal.findUnique({
    where: { id: payload.mealId },
    include: {
      providerProfile: {
        select: { approvalStatus: true, isOpen: true, businessName: true },
      },
    },
  });

  if (!meal) {
    throw new AppError(404, "Meal not found");
  }

  if (meal.availabilityStatus !== MealAvailabilityStatus.AVAILABLE) {
    throw new AppError(400, "This meal is currently unavailable");
  }

  if (meal.providerProfile.approvalStatus !== ProviderApprovalStatus.APPROVED) {
    throw new AppError(400, "This meal's provider is not currently active");
  }

  if (!meal.providerProfile.isOpen) {
    throw new AppError(
      400,
      `${meal.providerProfile.businessName} is currently closed`
    );
  }

  if (meal.stockQuantity !== null) {
    const existingItem = await prisma.cartItem.findUnique({
      where: { userId_mealId: { userId, mealId: payload.mealId } },
    });
    const currentQty = existingItem?.quantity ?? 0;
    const newTotalQty = currentQty + payload.quantity;

    if (newTotalQty > meal.stockQuantity) {
      const remaining = meal.stockQuantity - currentQty;
      if (remaining <= 0) {
        throw new AppError(400, "No more stock available for this meal");
      }
      throw new AppError(
        400,
        `Only ${remaining} more unit(s) of this meal can be added`
      );
    }
  }

  const cartItem = await prisma.cartItem.upsert({
    where: { userId_mealId: { userId, mealId: payload.mealId } },
    update: { quantity: { increment: payload.quantity } },
    create: { userId, mealId: payload.mealId, quantity: payload.quantity },
    include: {
      meal: {
        select: {
          id: true,
          title: true,
          price: true,
          image: true,
          availabilityStatus: true,
        },
      },
    },
  });

  return cartItem;
};

const updateCartItem = async (
  itemId: string,
  userId: string,
  payload: TUpdateCartItemPayload
) => {
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });

  if (!item) {
    throw new AppError(404, "Cart item not found");
  }

  if (item.userId !== userId) {
    throw new AppError(403, "You are not authorized to update this cart item");
  }

  if (item.mealId) {
    const meal = await prisma.meal.findUnique({
      where: { id: item.mealId },
      select: { stockQuantity: true },
    });

    if (meal?.stockQuantity !== null && meal?.stockQuantity !== undefined) {
      if (payload.quantity > meal.stockQuantity) {
        throw new AppError(
          400,
          `Only ${meal.stockQuantity} unit(s) available for this meal`
        );
      }
    }
  }

  const updated = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity: payload.quantity },
    include: {
      meal: {
        select: {
          id: true,
          title: true,
          price: true,
          image: true,
          availabilityStatus: true,
        },
      },
    },
  });

  return updated;
};

const removeCartItem = async (itemId: string, userId: string) => {
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });

  if (!item) {
    throw new AppError(404, "Cart item not found");
  }

  if (item.userId !== userId) {
    throw new AppError(403, "You are not authorized to remove this cart item");
  }

  await prisma.cartItem.delete({ where: { id: itemId } });

  return { message: "Item removed from cart" };
};

const clearCart = async (userId: string) => {
  await prisma.cartItem.deleteMany({ where: { userId } });

  return { message: "Cart cleared successfully" };
};

export const CartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
