import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import {
  TMealCreatePayload,
  TMealFilterOptions,
  TMealUpdatePayload,
} from "./meal.interface";
import {
  MealAvailabilityStatus,
  OrderStatus,
  ProviderApprovalStatus,
  ReviewStatus,
  Role,
} from "../../generated/enums";

const VALID_SORT_FIELDS = ["price", "createdAt", "title"] as const;
type SortField = (typeof VALID_SORT_FIELDS)[number];

const getAllMeals = async (filters: TMealFilterOptions) => {
  const {
    categoryId,
    providerProfileId,
    minPrice,
    maxPrice,
    dietaryTags,
    featured,
    availabilityStatus,
    search,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const safeSortBy: SortField = VALID_SORT_FIELDS.includes(sortBy as SortField)
    ? (sortBy as SortField)
    : "createdAt";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};

  if (categoryId) where.categoryId = categoryId;
  if (providerProfileId) where.providerProfileId = providerProfileId;
  if (featured !== undefined) where.featured = featured;
  if (availabilityStatus) where.availabilityStatus = availabilityStatus;

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (dietaryTags && dietaryTags.length > 0) {
    where.dietaryTags = { hasSome: dietaryTags };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { shortDescription: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safePage = Math.max(page, 1);
  const skip = (safePage - 1) * safeLimit;

  const [meals, total] = await Promise.all([
    prisma.meal.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { [safeSortBy]: sortOrder },
      include: {
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
        providerProfile: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            logo: true,
            averageRating: true,
            city: true,
            isOpen: true,
          },
        },
      },
    }),
    prisma.meal.count({ where }),
  ]);

  return {
    meals,
    meta: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

const getMealById = async (id: string) => {
  const meal = await prisma.meal.findUnique({
    where: { id },
    include: {
      category: true,
      providerProfile: {
        select: {
          id: true,
          businessName: true,
          slug: true,
          logo: true,
          banner: true,
          averageRating: true,
          city: true,
          address: true,
          isOpen: true,
          cuisineSpecialties: true,
        },
      },
      reviews: {
        where: { status: ReviewStatus.PUBLISHED },
        include: {
          customer: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!meal) throw new AppError(404, "Meal not found");

  return meal;
};

const createMeal = async (userId: string, payload: TMealCreatePayload) => {
  const providerProfile = await prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (!providerProfile) {
    throw new AppError(
      404,
      "Provider profile not found. Please create your profile first."
    );
  }

  if (providerProfile.approvalStatus !== ProviderApprovalStatus.APPROVED) {
    throw new AppError(
      403,
      "Your provider account is not yet approved. Please wait for admin approval."
    );
  }

  const existingSlug = await prisma.meal.findUnique({
    where: { slug: payload.slug },
  });
  if (existingSlug) {
    throw new AppError(409, "A meal with this slug already exists");
  }

  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });
  if (!category) {
    throw new AppError(404, "Category not found");
  }

  const meal = await prisma.meal.create({
    data: {
      ...payload,
      price: payload.price,
      providerProfileId: providerProfile.id,
      dietaryTags: payload.dietaryTags ?? [],
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      providerProfile: { select: { id: true, businessName: true, slug: true } },
    },
  });

  return meal;
};

const updateMeal = async (
  id: string,
  userId: string,
  role: Role,
  payload: TMealUpdatePayload
) => {
  const meal = await prisma.meal.findUnique({ where: { id } });
  if (!meal) throw new AppError(404, "Meal not found");

  if (role === Role.PROVIDER) {
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId },
    });
    if (!providerProfile || meal.providerProfileId !== providerProfile.id) {
      throw new AppError(403, "You are not authorized to update this meal");
    }
  }

  if (payload.slug && payload.slug !== meal.slug) {
    const slugConflict = await prisma.meal.findUnique({
      where: { slug: payload.slug },
    });
    if (slugConflict) {
      throw new AppError(409, "A meal with this slug already exists");
    }
  }

  if (payload.categoryId && payload.categoryId !== meal.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });
    if (!category) throw new AppError(404, "Category not found");
  }

  const updated = await prisma.meal.update({
    where: { id },
    data: payload,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      providerProfile: { select: { id: true, businessName: true, slug: true } },
    },
  });

  return updated;
};

const deleteMeal = async (id: string, userId: string, role: Role) => {
  const meal = await prisma.meal.findUnique({ where: { id } });
  if (!meal) throw new AppError(404, "Meal not found");

  if (role === Role.PROVIDER) {
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId },
    });
    if (!providerProfile || meal.providerProfileId !== providerProfile.id) {
      throw new AppError(403, "You are not authorized to delete this meal");
    }
  }

  const activeOrderCount = await prisma.orderItem.count({
    where: {
      mealId: id,
      order: {
        status: {
          notIn: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
        },
      },
    },
  });

  if (activeOrderCount > 0) {
    throw new AppError(
      400,
      "Cannot delete this meal. It is part of one or more active orders."
    );
  }

  await prisma.meal.delete({ where: { id } });

  return { message: "Meal deleted successfully" };
};

const toggleAvailability = async (id: string, userId: string) => {
  const meal = await prisma.meal.findUnique({ where: { id } });
  if (!meal) throw new AppError(404, "Meal not found");

  const providerProfile = await prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (!providerProfile || meal.providerProfileId !== providerProfile.id) {
    throw new AppError(403, "You are not authorized to update this meal");
  }

  const newStatus =
    meal.availabilityStatus === MealAvailabilityStatus.AVAILABLE
      ? MealAvailabilityStatus.UNAVAILABLE
      : MealAvailabilityStatus.AVAILABLE;

  const updated = await prisma.meal.update({
    where: { id },
    data: { availabilityStatus: newStatus },
  });

  return updated;
};

export const MealService = {
  getAllMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
  toggleAvailability,
};
