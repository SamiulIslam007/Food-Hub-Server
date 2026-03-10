import express from "express";
import { ProviderController } from "./provider.controller";
import { providerValidationSchema } from "./provider.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorize";
import { Role } from "../../generated/enums";

const router = express.Router();

router.get(
  "/",
  validateRequest(providerValidationSchema.getProvidersQuerySchema),
  ProviderController.getAllProviders
);

// /me routes must be defined before /:id to prevent route conflict
router.post(
  "/me",
  auth,
  authorize(Role.PROVIDER),
  validateRequest(providerValidationSchema.createProviderSchema),
  ProviderController.createProfile
);

router.get(
  "/me",
  auth,
  authorize(Role.PROVIDER),
  ProviderController.getMyProfile
);

router.patch(
  "/me",
  auth,
  authorize(Role.PROVIDER),
  validateRequest(providerValidationSchema.updateProviderSchema),
  ProviderController.updateMyProfile
);

router.patch(
  "/:id/approval",
  auth,
  authorize(Role.ADMIN),
  validateRequest(providerValidationSchema.approvalSchema),
  ProviderController.approveOrRejectProvider
);

// must be last — /:id would otherwise catch /me and /:id/approval
router.get("/:id", ProviderController.getProviderById);

export const ProviderRoutes = router;
