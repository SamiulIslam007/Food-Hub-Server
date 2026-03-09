import express from "express";
import { AuthController } from "./auth.controller";
import { authValidationSchema } from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";

const router = express.Router();

// POST /api/v1/auth/register
router.post(
  "/register",
  validateRequest(authValidationSchema.registerSchema),
  AuthController.register
);

// POST /api/v1/auth/login
router.post(
  "/login",
  validateRequest(authValidationSchema.loginSchema),
  AuthController.login
);

// GET /api/v1/auth/me  — protected
router.get("/me", auth, AuthController.getMe);

// POST /api/v1/auth/refresh-token
router.post("/refresh-token", AuthController.refreshToken);

// POST /api/v1/auth/logout
router.post("/logout", AuthController.logout);

export const AuthRoutes = router;
