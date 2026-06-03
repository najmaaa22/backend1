import express from "express";
import { getAnalytics } from "./analytics.controller";


const router = express.Router();

router.get("/:id", getAnalytics);

export default router;