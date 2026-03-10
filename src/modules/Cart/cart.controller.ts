import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { CartService } from "./cart.service";

const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CartService.getCart(req.user!.userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Cart retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CartService.addToCart(req.user!.userId, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Item added to cart",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await CartService.updateCartItem(
      req.params.itemId as string,
      req.user!.userId,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Cart item updated",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await CartService.removeCartItem(
      req.params.itemId as string,
      req.user!.userId
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

const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CartService.clearCart(req.user!.userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const CartController = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
