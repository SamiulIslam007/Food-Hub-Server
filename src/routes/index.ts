import { Request, Response, Router } from "express";
import { AuthRoutes } from "../modules/Auth/auth.route";

const router = Router();

const routerManager = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
];

routerManager.forEach((r) => router.use(r.path, r.route));

router.get("/", (_req: Request, res: Response) => {
  res.json({ message: "FoodHub API is running." });
});

export default router;
