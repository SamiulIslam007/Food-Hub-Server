import { Response } from "express";

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
};

const sendResponse = <T>(res: Response, payload: TResponse<T>): void => {
  res.status(payload.statusCode).json({
    success: payload.success,
    statusCode: payload.statusCode,
    message: payload.message,
    data: payload.data ?? null,
  });
};

export default sendResponse;
