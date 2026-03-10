import express from "express";
import { MealController } from "./meal.controller";
import { mealValidationSchema } from "./meal.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorize";
import { Role } from "../../generated/enums";

const router = express.Router();

router.get(
  "/",
  validateRequest(mealValidationSchema.getMealsQuerySchema),
  MealController.getAllMeals
);

router.get("/:id", MealController.getMealById);

router.post(
  "/",
  auth,
  authorize(Role.PROVIDER),
  validateRequest(mealValidationSchema.createMealSchema),
  MealController.createMeal
);

// must be defined before PATCH /:id to avoid route conflict
router.patch(
  "/:id/toggle-availability",
  auth,
  authorize(Role.PROVIDER),
  MealController.toggleAvailability
);

router.patch(
  "/:id",
  auth,
  authorize(Role.PROVIDER, Role.ADMIN),
  validateRequest(mealValidationSchema.updateMealSchema),
  MealController.updateMeal
);

router.delete(
  "/:id",
  auth,
  authorize(Role.PROVIDER, Role.ADMIN),
  MealController.deleteMeal
);

export const MealRoutes = router;
