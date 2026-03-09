import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  port: process.env.PORT || 5000,
  node_env: process.env.NODE_ENV || "development",
  database_url: process.env.DATABASE_URL,
  client_url: process.env.CLIENT_URL || "http://localhost:3000",

  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,

  jwt_access_secret: process.env.JWT_ACCESS_SECRET as string,
  jwt_access_expires_in: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as string,

  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET as string,
  jwt_refresh_expires_in: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as string,
};
