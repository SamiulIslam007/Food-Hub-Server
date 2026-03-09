import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

const validateRequest =
  (schema: z.ZodType) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(err);
      } else {
        next(err);
      }
    }
  };

export default validateRequest;
