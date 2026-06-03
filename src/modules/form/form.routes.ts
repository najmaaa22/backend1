import express from "express";
import {
  createForm,
  getForms,
  getFormById,
  updateForm,
  deleteForm,
} from "./form.controller";

import { protect, adminOnly } from "../../middlewares/auth.middleware";

const router = express.Router();
router.post("/", protect, adminOnly, createForm);
router.get("/", protect, getForms);
router.get("/:id", protect, getFormById);
router.get("/id/:id", protect, getFormById);
router.put("/:id", protect, adminOnly, updateForm);
router.put("/id/:id", protect, adminOnly, updateForm);
router.delete("/:id", protect, adminOnly, deleteForm);

export default router;