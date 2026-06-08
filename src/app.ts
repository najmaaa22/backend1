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
app.use(express.urlencoded({ extended: true }));

// API Base Routes
app.use("/api/auth", authRoutes);
app.use("/api/forms", formRoutes);      

app.use("/api/responses", responseRoutes); 
app.use("/api/analytics", analyticsRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

export default app;