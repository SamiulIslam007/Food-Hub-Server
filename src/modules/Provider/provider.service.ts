import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import {
  TProviderApprovalPayload,
  TProviderCreatePayload,
  TProviderFilterOptions,
  TProviderUpdatePayload,
} from "./provider.interface";
import {
  MealAvailabilityStatus,
  ProviderApprovalStatus,
} from "../../generated/enums";

const VALID_SORT_FIELDS = ["businessName", "createdAt", "averageRating"] as const;
type SortField = (typeof VALID_SORT_FIELDS)[number];

const getAllProviders = async (filters: TProviderFilterOptions) => {
  const {
    city,
    cuisineSpecialty,
    search,
    isOpen,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const safeSortBy: SortField = VALID_SORT_FIELDS.includes(sortBy as SortField)
    ? (sortBy as SortField)
    : "createdAt";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {
    approvalStatus: ProviderApprovalStatus.APPROVED,
  };

  if (city) where.city = { contains: city, mode: "insensitive" };
  if (isOpen !== undefined) where.isOpen = isOpen;
  if (cuisineSpecialty) {
    where.cuisineSpecialties = { hasSome: [cuisineSpecialty] };
  }
  if (search) {
    where.OR = [
      { businessName: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const safePage = Math.max(page, 1);
  const skip = (safePage - 1) * safeLimit;

  const [providers, total] = await Promise.all([
    prisma.providerProfile.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { [safeSortBy]: sortOrder },
      include: {
        user: { select: { name: true, avatar: true } },
        _count: { select: { meals: true } },
      },
    }),
    prisma.providerProfile.count({ where }),
  ]);

  return {
    providers,
    meta: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

const getProviderById = async (id: string) => {
  const profile = await prisma.providerProfile.findUnique({
    where: { id, approvalStatus: ProviderApprovalStatus.APPROVED },
    include: {
      user: { select: { name: true, avatar: true } },
      meals: {
        where: { availabilityStatus: MealAvailabilityStatus.AVAILABLE },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: 8,
        include: {
          category: { select: { id: true, name: true, slug: true, icon: true } },
        },
      },
      _count: { select: { meals: true } },
    },
  });

  if (!profile) throw new AppError(404, "Provider not found");

  return profile;
};

const getMyProfile = async (userId: string) => {
  const profile = await prisma.providerProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          phone: true,
        },
      },
      _count: { select: { meals: true, orders: true } },
    },
  });

  if (!profile) {
    throw new AppError(
      404,
      "Provider profile not found. Please create your profile first."
    );
  }

  return profile;
};

const createProfile = async (
  userId: string,
  payload: TProviderCreatePayload
) => {
  const existing = await prisma.providerProfile.findUnique({
    where: { userId },
  });
  if (existing) {
    throw new AppError(409, "You already have a provider profile");
  }

  const slugConflict = await prisma.providerProfile.findUnique({
    where: { slug: payload.slug },
  });
  if (slugConflict) {
    throw new AppError(409, "A provider with this slug already exists");
  }

  const nameConflict = await prisma.providerProfile.findFirst({
    where: { businessName: { equals: payload.businessName, mode: "insensitive" } },
  });
  if (nameConflict) {
    throw new AppError(409, "A provider with this business name already exists");
  }

  const profile = await prisma.providerProfile.create({
    data: {
      ...payload,
      userId,
      cuisineSpecialties: payload.cuisineSpecialties ?? [],
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return profile;
};

const updateMyProfile = async (
  userId: string,
  payload: TProviderUpdatePayload
) => {
  const profile = await prisma.providerProfile.findUnique({
    where: { userId },
  });
  if (!profile) {
    throw new AppError(
      404,
      "Provider profile not found. Please create your profile first."
    );
  }

  if (payload.slug && payload.slug !== profile.slug) {
    const slugConflict = await prisma.providerProfile.findUnique({
      where: { slug: payload.slug },
    });
    if (slugConflict) {
      throw new AppError(409, "A provider with this slug already exists");
    }
  }

  if (
    payload.businessName &&
    payload.businessName.toLowerCase() !== profile.businessName.toLowerCase()
  ) {
    const nameConflict = await prisma.providerProfile.findFirst({
      where: {
        businessName: { equals: payload.businessName, mode: "insensitive" },
      },
    });
    if (nameConflict) {
      throw new AppError(
        409,
        "A provider with this business name already exists"
      );
    }
  }

  const updated = await prisma.providerProfile.update({
    where: { userId },
    data: payload,
  });

  return updated;
};

const approveOrRejectProvider = async (
  id: string,
  payload: TProviderApprovalPayload
) => {
  const profile = await prisma.providerProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (!profile) throw new AppError(404, "Provider profile not found");

  if (profile.approvalStatus === payload.approvalStatus) {
    throw new AppError(
      400,
      `Provider is already ${payload.approvalStatus.toLowerCase()}`
    );
  }

  const updated = await prisma.providerProfile.update({
    where: { id },
    data: { approvalStatus: payload.approvalStatus },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return updated;
};

export const ProviderService = {
  getAllProviders,
  getProviderById,
  getMyProfile,
  createProfile,
  updateMyProfile,
  approveOrRejectProvider,
};
