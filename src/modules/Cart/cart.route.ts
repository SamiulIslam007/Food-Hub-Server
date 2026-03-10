import express from "express";
import { CartController } from "./cart.controller";
import { cartValidationSchema } from "./cart.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorize";
import { Role } from "../../generated/enums";

const router = express.Router();

router.use(auth, authorize(Role.CUSTOMER));

router.get("/", CartController.getCart);

router.post(
  "/",
  validateRequest(cartValidationSchema.addToCartSchema),
  CartController.addToCart
);

router.patch(
  "/:itemId",
  validateRequest(cartValidationSchema.updateCartItemSchema),
  CartController.updateCartItem
);

router.delete("/:itemId", CartController.removeCartItem);

router.delete("/", CartController.clearCart);

export const CartRoutes = router;
