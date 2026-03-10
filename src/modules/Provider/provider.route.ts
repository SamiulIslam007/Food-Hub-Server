import express from "express";
import { ProviderController } from "./provider.controller";
import { providerValidationSchema } from "./provider.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorize";
import { Role } from "../../generated/enums";

const router = express.Router();

// GET /api/v1/providers — public, list approved providers (with filters)
router.get(
  "/",
  validateRequest(providerValidationSchema.getProvidersQuerySchema),
  ProviderController.getAllProviders
);

// POST /api/v1/providers/me — PROVIDER only, create own profile
// NOTE: /me routes must be defined BEFORE /:id to prevent route conflict
router.post(
  "/me",
  auth,
  authorize(Role.PROVIDER),
  validateRequest(providerValidationSchema.createProviderSchema),
  ProviderController.createProfile
);

// GET /api/v1/providers/me — PROVIDER only, get own full profile
router.get(
  "/me",
  auth,
  authorize(Role.PROVIDER),
  ProviderController.getMyProfile
);

// PATCH /api/v1/providers/me — PROVIDER only, update own profile
router.patch(
  "/me",
  auth,
  authorize(Role.PROVIDER),
  validateRequest(providerValidationSchema.updateProviderSchema),
  ProviderController.updateMyProfile
);

// PATCH /api/v1/providers/:id/approval — ADMIN only, approve or reject
router.patch(
  "/:id/approval",
  auth,
  authorize(Role.ADMIN),
  validateRequest(providerValidationSchema.approvalSchema),
  ProviderController.approveOrRejectProvider
);

// GET /api/v1/providers/:id — public, single approved provider with meals
// NOTE: must be LAST to avoid catching /me or /:id/approval
router.get("/:id", ProviderController.getProviderById);

export const ProviderRoutes = router;
