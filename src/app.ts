import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";
import config from "./config";

const app: Application = express();

app.use(express.json());
app.use(
  cors({
    origin: config.client_url,
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api/v1", router);

app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "FoodHub server is running.",
  });
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;
