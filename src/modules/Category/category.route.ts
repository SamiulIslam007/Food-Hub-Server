import express from "express";
import { CategoryController } from "./category.controller";
import { categoryValidationSchema } from "./category.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorize";
import { Role } from "../../generated/enums";

const router = express.Router();

router.get("/", CategoryController.getAllCategories);

router.get("/:id", CategoryController.getCategoryById);

router.post(
  "/",
  auth,
  authorize(Role.ADMIN),
  validateRequest(categoryValidationSchema.createCategorySchema),
  CategoryController.createCategory
);

router.patch(
  "/:id",
  auth,
  authorize(Role.ADMIN),
  validateRequest(categoryValidationSchema.updateCategorySchema),
  CategoryController.updateCategory
);

router.delete(
  "/:id",
  auth,
  authorize(Role.ADMIN),
  CategoryController.deleteCategory
);

export const CategoryRoutes = router;
