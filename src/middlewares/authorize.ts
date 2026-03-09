import { NextFunction, Request, Response } from "express";
import AppError from "../errors/AppError";

const authorize =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(401, "You are not authenticated");
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        403,
        "You are not authorized to perform this action"
      );
    }

    next();
  };

export default authorize;
