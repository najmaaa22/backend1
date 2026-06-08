import { Request, Response } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

import {
  createFormService,
  getFormsService,
  getFormByIdService,
  updateFormService,
  deleteFormService,
} from "./form.service";

// ================= VALIDATION =================
const formSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
  isQuiz: z.boolean().default(false),

  allowedUsers: z.array(z.string()).optional().default([]),

  fields: z.array(
    z.object({
      fieldId: z.string(),
      label: z.string(),
      type: z.enum([
        "text",
        "number",
        "textarea",
        "select",
        "radio",
        "checkbox",
        "date",
      ]),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional().default([]),

      validation: z
        .object({
          minLength: z.number().optional(),
          maxLength: z.number().optional(),
          pattern: z.string().optional(),
        })
        .optional(),

      correctAnswer: z.any().optional(),
    })
  ),
});

// ================= HELPERS =================
const getStringId = (id: string | string[] | undefined): string =>
  Array.isArray(id) ? id[0] : id ?? "";

// ================= CONTROLLERS =================

// CREATE FORM
export const createForm = async (req: Request, res: Response) => {
  try {
    const result = formSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const data = {
      ...result.data,
      formGroupId: uuidv4(),
      version: 1,
      createdBy: (req as any).user?.id,
    };

    const form = await createFormService(data);

    return res.status(201).json({
      success: true,
      data: form,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

// GET FORMS
export const getForms = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = new mongoose.Types.ObjectId(user.id);

    const filter: any = { isActive: true };

    if (user.role === "admin") {
      filter.createdBy = userId;
    } else {
      filter.$or = [
        { allowedUsers: { $in: [userId] } },
        { allowedUsers: { $size: 0 } },
        { allowedUsers: { $exists: false } },
      ];
    }

    const forms = await getFormsService(filter);

    return res.status(200).json({
      success: true,
      data: Array.isArray(forms) ? forms : [],
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
      data: [],
    });
  }
};

// GET BY ID
export const getFormById = async (req: Request, res: Response) => {
  try {
    const id = getStringId(req.params.id);

    const form = await getFormByIdService(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: form,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

// UPDATE (NEW VERSION)
export const updateForm = async (req: Request, res: Response) => {
  try {
    const id = getStringId(req.params.id);

    const result = formSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const updated = await updateFormService(id, {
      ...result.data,
      createdBy: (req as any).user?.id,
    });

    return res.status(200).json({
      success: true,
      message: "New version created",
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

// DELETE
export const deleteForm = async (req: Request, res: Response) => {
  try {
    const id = getStringId(req.params.id);

    const result = await deleteFormService(id);

    return res.status(200).json({
      success: true,
      message: result.message || "Deleted successfully",
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};