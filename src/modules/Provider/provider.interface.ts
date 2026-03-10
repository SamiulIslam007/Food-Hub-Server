export type TProviderCreatePayload = {
  businessName: string;
  slug: string;
  logo?: string;
  banner?: string;
  description?: string;
  address: string;
  city?: string;
  cuisineSpecialties?: string[];
};

export type TProviderUpdatePayload = Partial<TProviderCreatePayload> & {
  isOpen?: boolean;
};

export type TProviderApprovalPayload = {
  approvalStatus: "APPROVED" | "REJECTED";
};

export type TProviderFilterOptions = {
  city?: string;
  cuisineSpecialty?: string;
  search?: string;
  isOpen?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
