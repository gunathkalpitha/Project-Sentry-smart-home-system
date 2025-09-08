import dotenv from "dotenv";
dotenv.config(); // Load variables from .env

export const PORT = process.env.PORT || 5000;
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const CORS_ORIGIN = process.env.CORS_ORIGIN;
