export type TRegisterPayload = {
  name: string;
  email: string;
  password: string;
  role?: "CUSTOMER" | "PROVIDER";
  phone?: string;
};

export type TLoginPayload = {
  email: string;
  password: string;
};

export type TJwtPayload = {
  userId: string;
  email: string;
  role: string;
};

export type TAuthTokens = {
  accessToken: string;
  refreshToken: string;
};
