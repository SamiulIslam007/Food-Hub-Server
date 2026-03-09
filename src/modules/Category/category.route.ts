import express from "express";
import { CategoryController } from "./category.controller";
import { categoryValidationSchema } from "./category.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorize";
import { Role } from "../../generated/enums";

const router = express.Router();

// GET /api/v1/categories — public
router.get("/", CategoryController.getAllCategories);

// GET /api/v1/categories/:id — public
router.get("/:id", CategoryController.getCategoryById);

// POST /api/v1/categories — ADMIN only
router.post(
  "/",
  auth,
  authorize(Role.ADMIN),
  validateRequest(categoryValidationSchema.createCategorySchema),
  CategoryController.createCategory
);

// PATCH /api/v1/categories/:id — ADMIN only
router.patch(
  "/:id",
  auth,
  authorize(Role.ADMIN),
  validateRequest(categoryValidationSchema.updateCategorySchema),
  CategoryController.updateCategory
);

// DELETE /api/v1/categories/:id — ADMIN only
router.delete(
  "/:id",
  auth,
  authorize(Role.ADMIN),
  CategoryController.deleteCategory
);

export const CategoryRoutes = router;
