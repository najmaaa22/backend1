import express from "express";

import {
  submitResponse,
  getResponses,
  exportResponsesCSV,
  getAnalytics,
  getMyResponse,
} from "./response.controller";

// നിങ്ങളുടെ rateLimits.ts ഫയലിലെ കൃത്യമായ പേര് ഇമ്പോർട്ട് ചെയ്തു
import { submitLimiter } from "../../middlewares/rateLimits"; 

// നിങ്ങളുടെ auth.middleware-ൽ നിന്നുള്ള പ്രൊട്ടക്ഷൻ മിഡിൽവെയറുകൾ
import { protect, adminOnly } from "../../middlewares/auth.middleware";

const router = express.Router();

// ==========================================
// 👤 USER ROUTES
// ==========================================

// ✅ GET USER'S PREVIOUS RESPONSE
router.get(
  "/:id/my-response",
  protect,
  getMyResponse
);

// ✅ SUBMIT RESPONSE (Rate Limiter പ്രൊട്ടക്ഷൻ ഉണ്ട്)
router.post(
  "/:id/submit",
  protect,
  submitLimiter, 
  submitResponse
);

// ==========================================
// 🛡️ ADMIN ONLY ROUTES
// ==========================================

// ✅ GET ALL RESPONSES
router.get(
  "/:id/responses",
  protect,
  adminOnly, 
  getResponses
);

// ✅ EXPORT CSV
router.get(
  "/:id/export",
  protect,
  adminOnly, 
  exportResponsesCSV
);

// ✅ ANALYTICS
router.get(
  "/:id/analytics",
  protect,
  adminOnly, 
  getAnalytics
);

export default router;