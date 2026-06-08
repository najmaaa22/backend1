
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

// CREATE FORM
router.post("/", protect, adminOnly, createForm);

// GET ALL FORMS
// ✅ REMOVE protect
router.get("/", getForms);

// GET SINGLE FORM
// ✅ REMOVE protect
router.get("/:id", getFormById);

// UPDATE FORM
router.put("/:id", protect, adminOnly, updateForm);

// DELETE FORM
router.delete("/:id", protect, adminOnly, deleteForm);

export default router;
