import express from "express";

import {
  submitResponse,
  getResponses,
  exportResponsesCSV,
  getAnalytics,
  getMyResponse,
} from "./response.controller";

import {
  submitLimiter,
} from "../../middlewares/rateLimits";

import { protect } from "../../middlewares/auth.middleware";

const router = express.Router();

// ✅ GET USER'S PREVIOUS RESPONSE
router.get(
  "/:id/my-response",
  protect,
  getMyResponse
);

// ✅ SUBMIT RESPONSE
router.post(
  "/:id/submit",
  protect,
  submitLimiter,
  submitResponse
);

// ✅ GET ALL RESPONSES (Admins only)
router.get(
  "/:id/responses",
  protect,
  getResponses
);

// ✅ EXPORT CSV (Admins only)
router.get(
  "/:id/export",
  protect,
  exportResponsesCSV
);

// ✅ ANALYTICS
router.get(
  "/:id/analytics",
  protect,
  getAnalytics
);

export default router;