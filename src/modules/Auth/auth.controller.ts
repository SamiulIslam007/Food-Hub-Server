import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import { AUTH_COOKIE_NAME, COOKIE_MAX_AGE_7_DAYS } from "./auth.constant";

const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);
  const { refreshToken, ...responseData } = result;

  res.cookie(AUTH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE_7_DAYS,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Logged in successfully",
    data: responseData,
  });
});

const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await AuthService.getMe(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User profile retrieved successfully",
    data: result,
  });
});

const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Refresh token is missing. Please log in again.",
    });
    return;
  }

  const result = await AuthService.refreshToken(token);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Access token refreshed successfully",
    data: result,
  });
});

const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  const result = AuthService.logout();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
  });
});

export const AuthController = {
  register,
  login,
  getMe,
  refreshToken,
  logout,
};
