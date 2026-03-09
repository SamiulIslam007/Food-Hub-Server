import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import AppError from "../errors/AppError";
import asyncHandler from "../utils/asyncHandler";

const auth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "Authentication token is missing");
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(
        token,
        config.jwt_access_secret
      ) as JwtPayload & {
        userId: string;
        email: string;
        role: string;
      };

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch {
      throw new AppError(401, "Invalid or expired access token");
    }
  }
);

export default auth;
