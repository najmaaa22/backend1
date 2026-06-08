import express from "express";
import { getAnalytics } from "./analytics.controller";
import { protect, adminOnly } from "../../middlewares/auth.middleware";
const router = express.Router();


router.get(
  "/:id", 
  protect, 
  adminOnly, 
  getAnalytics 
);

export default router;