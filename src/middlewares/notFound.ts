import { Request, Response } from "express";

const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export default notFound;
