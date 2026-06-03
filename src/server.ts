import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app";

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI not configured");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET not configured");
}

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("DB Connection Error:", err);
    process.exit(1);
  });