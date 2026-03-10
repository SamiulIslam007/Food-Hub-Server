import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { MealService } from "./meal.service";
import { TMealFilterOptions } from "./meal.interface";
import { MealAvailabilityStatus, Role } from "../../generated/enums";

const getAllMeals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      categoryId,
      providerProfileId,
      minPrice,
      maxPrice,
      dietaryTags,
      featured,
      availabilityStatus,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    } = req.query;

    const filters: TMealFilterOptions = {
      categoryId: categoryId as string | undefined,
      providerProfileId: providerProfileId as string | undefined,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      dietaryTags: dietaryTags
        ? (dietaryTags as string).split(",").map((t) => t.trim()).filter(Boolean)
        : undefined,
      featured:
        featured === "true" ? true : featured === "false" ? false : undefined,
      availabilityStatus: availabilityStatus as MealAvailabilityStatus | undefined,
      search: search as string | undefined,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
      sortBy: sortBy as string | undefined,
      sortOrder: sortOrder as "asc" | "desc" | undefined,
    };

    const result = await MealService.getAllMeals(filters);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Meals retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMealById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await MealService.getMealById(req.params.id as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Meal retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const createMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await MealService.createMeal(req.user!.userId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Meal created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await MealService.updateMeal(
      req.params.id as string,
      req.user!.userId,
      req.user!.role as Role,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Meal updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await MealService.deleteMeal(
      req.params.id as string,
      req.user!.userId,
      req.user!.role as Role
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const toggleAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await MealService.toggleAvailability(
      req.params.id as string,
      req.user!.userId
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Meal is now ${result.availabilityStatus === "AVAILABLE" ? "available" : "unavailable"}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const MealController = {
  getAllMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
  toggleAvailability,
};
