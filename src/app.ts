import express from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes";
import formRoutes from "./modules/form/form.routes";
import responseRoutes from "./modules/responses/response.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";

const app = express();

app.use(cors({
  origin: "*",
  credentials: false,
}));

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/forms", responseRoutes);
app.use("/api/analytics", analyticsRoutes);

export default app;