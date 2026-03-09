import { Router } from "express";
import { AuthRoutes } from "../modules/Auth/auth.route";

const router = Router();

const routerManager = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
];

// Register all module routes
routerManager.forEach((r) => router.use(r.path, r.route));

// Example base route (API health check)
router.get("/", (req, res) => {
  res.json({ message: "FoodHub API is running." });
});

export default router;
