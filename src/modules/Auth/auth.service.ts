import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import AppError from "../../errors/AppError";
import {
  TAuthTokens,
  TJwtPayload,
  TLoginPayload,
  TRegisterPayload,
} from "./auth.interface";

const generateTokens = (payload: TJwtPayload): TAuthTokens => {
  const accessToken = jwt.sign(payload, config.jwt_access_secret, {
    expiresIn: config.jwt_access_expires_in as any,
  });

  const refreshToken = jwt.sign(payload, config.jwt_refresh_secret, {
    expiresIn: config.jwt_refresh_expires_in as any,
  });

  return { accessToken, refreshToken };
};

const register = async (payload: TRegisterPayload) => {
  const { name, email, password, role = "CUSTOMER", phone } = payload;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError(409, "An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, config.bcrypt_salt_rounds);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role, phone },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

const login = async (payload: TLoginPayload) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  if (user.status === "SUSPENDED") {
    throw new AppError(
      403,
      "Your account has been suspended. Please contact support.",
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(401, "Invalid email or password");
  }

  const jwtPayload: TJwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const tokens = generateTokens(jwtPayload);

  const { password: _password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, ...tokens };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
      providerProfile: {
        select: {
          id: true,
          businessName: true,
          slug: true,
          logo: true,
          approvalStatus: true,
          isOpen: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};

const refreshToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, config.jwt_refresh_secret) as JwtPayload &
      TJwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) {
      throw new AppError(
        401,
        "User associated with this token no longer exists",
      );
    }

    if (user.status === "SUSPENDED") {
      throw new AppError(403, "Your account has been suspended");
    }

    const jwtPayload: TJwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret, {
      expiresIn: config.jwt_access_expires_in as any,
    });

    return { accessToken };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(401, "Invalid or expired refresh token");
  }
};

const logout = () => {
  return { message: "Logged out successfully" };
};

export const AuthService = {
  register,
  login,
  getMe,
  refreshToken,
  logout,
};
