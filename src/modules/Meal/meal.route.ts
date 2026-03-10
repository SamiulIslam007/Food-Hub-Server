import express from "express";
import { MealController } from "./meal.controller";
import { mealValidationSchema } from "./meal.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorize";
import { Role } from "../../generated/enums";

const router = express.Router();

// GET /api/v1/meals — public, supports filtering & pagination
router.get(
  "/",
  validateRequest(mealValidationSchema.getMealsQuerySchema),
  MealController.getAllMeals
);

// GET /api/v1/meals/:id — public
router.get("/:id", MealController.getMealById);

// POST /api/v1/meals — PROVIDER only
router.post(
  "/",
  auth,
  authorize(Role.PROVIDER),
  validateRequest(mealValidationSchema.createMealSchema),
  MealController.createMeal
);

// PATCH /api/v1/meals/:id/toggle-availability — PROVIDER only (must be before /:id)
router.patch(
  "/:id/toggle-availability",
  auth,
  authorize(Role.PROVIDER),
  MealController.toggleAvailability
);

// PATCH /api/v1/meals/:id — PROVIDER (own meals) or ADMIN
router.patch(
  "/:id",
  auth,
  authorize(Role.PROVIDER, Role.ADMIN),
  validateRequest(mealValidationSchema.updateMealSchema),
  MealController.updateMeal
);

// DELETE /api/v1/meals/:id — PROVIDER (own meals) or ADMIN
router.delete(
  "/:id",
  auth,
  authorize(Role.PROVIDER, Role.ADMIN),
  MealController.deleteMeal
);

export const MealRoutes = router;
