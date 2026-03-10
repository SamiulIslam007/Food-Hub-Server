import { MealAvailabilityStatus } from "../../generated/enums";

export type TMealCreatePayload = {
  categoryId: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  price: number;
  image?: string;
  availabilityStatus?: MealAvailabilityStatus;
  stockQuantity?: number;
  spiceLevel?: string;
  dietaryTags?: string[];
  preparationTime?: number;
  featured?: boolean;
};

export type TMealUpdatePayload = Partial<TMealCreatePayload>;

export type TMealFilterOptions = {
  categoryId?: string;
  providerProfileId?: string;
  minPrice?: number;
  maxPrice?: number;
  dietaryTags?: string[];
  featured?: boolean;
  availabilityStatus?: MealAvailabilityStatus;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
