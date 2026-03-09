export type TCategoryCreatePayload = {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
};

export type TCategoryUpdatePayload = Partial<TCategoryCreatePayload>;
