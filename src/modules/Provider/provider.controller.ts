import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { ProviderService } from "./provider.service";
import { TProviderFilterOptions } from "./provider.interface";

const getAllProviders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { city, cuisineSpecialty, search, isOpen, page, limit, sortBy, sortOrder } =
      req.query;

    const filters: TProviderFilterOptions = {
      city: city as string | undefined,
      cuisineSpecialty: cuisineSpecialty as string | undefined,
      search: search as string | undefined,
      isOpen:
        isOpen === "true" ? true : isOpen === "false" ? false : undefined,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
      sortBy: sortBy as string | undefined,
      sortOrder: sortOrder as "asc" | "desc" | undefined,
    };

    const result = await ProviderService.getAllProviders(filters);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Providers retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getProviderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await ProviderService.getProviderById(req.params.id as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Provider retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await ProviderService.getMyProfile(req.user!.userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Provider profile retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const createProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await ProviderService.createProfile(
      req.user!.userId,
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Provider profile created successfully. Awaiting admin approval.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await ProviderService.updateMyProfile(
      req.user!.userId,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Provider profile updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const approveOrRejectProvider = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await ProviderService.approveOrRejectProvider(
      req.params.id as string,
      req.body
    );

    const action =
      result.approvalStatus === "APPROVED" ? "approved" : "rejected";

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Provider has been ${action} successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const ProviderController = {
  getAllProviders,
  getProviderById,
  getMyProfile,
  createProfile,
  updateMyProfile,
  approveOrRejectProvider,
};
