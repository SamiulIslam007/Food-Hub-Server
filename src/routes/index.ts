import { Request, Response, Router } from "express";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { CategoryRoutes } from "../modules/Category/category.route";
import { MealRoutes } from "../modules/Meal/meal.route";
import { ProviderRoutes } from "../modules/Provider/provider.route";
import { CartRoutes } from "../modules/Cart/cart.route";

const router = Router();

const routerManager = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/categories",
    route: CategoryRoutes,
  },
  {
    path: "/meals",
    route: MealRoutes,
  },
  {
    path: "/providers",
    route: ProviderRoutes,
  },
  {
    path: "/cart",
    route: CartRoutes,
  },
];

routerManager.forEach((r) => router.use(r.path, r.route));

router.get("/", (_req: Request, res: Response) => {
  res.json({ message: "FoodHub API is running." });
});

export default router;
