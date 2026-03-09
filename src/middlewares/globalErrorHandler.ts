import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import AppError from "../errors/AppError";
import { ZodError } from "zod";

const globalErrorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errorDetails: unknown = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = { message: err.message };
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errorDetails = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  } else if (err instanceof Error) {
    message = err.message;
    errorDetails = { message: err.message };
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errorDetails,
  });
};

export default globalErrorHandler;
