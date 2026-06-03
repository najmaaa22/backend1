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

const getStringId = (
  id: string | string[]
) => {
  return Array.isArray(id)
    ? id[0]
    : id;
};

const formSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required"),

  description: z
    .string()
    .optional()
    .default(""),

  isQuiz: z
    .boolean()
    .default(false),

  allowedUsers: z
    .array(z.string())
    .optional()
    .default([]),

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

      required: z
        .boolean()
        .default(false),

      options: z
        .array(z.string())
        .optional()
        .default([]),

      validation: z
        .object({
          minLength: z.number().optional(),
          maxLength: z.number().optional(),
          pattern: z.string().optional(),
        })
        .optional(),

      correctAnswer: z
        .any()
        .optional()
        .default(null),
    })
  ),
});

export const createForm = async (
  req: Request,
  res: Response
) => {
  try {
    const result =
      formSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors: result.error.issues,
      });
    }

    const data = {
      ...result.data,
      formGroupId: uuidv4(),
      version: 1,
      isActive: true,
      createdBy: (req as any).user.id,
    };

    const form =
      await createFormService(data);

    return res.status(201).json({
      success: true,
      message:
        "Form created successfully",
      data: form,
    });
  } catch (error: any) {
    console.log(
      "CREATE FORM ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error",
    });
  }
};

export const updateForm = async (
  req: Request,
  res: Response
) => {
  try {
    const formId = getStringId(
      req.params.id
    );

    const result =
      formSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors: result.error.issues,
      });
    }

    const existingForm =
      await getFormByIdService(formId);

    if (!existingForm) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    // Verify creator
    if (existingForm.createdBy && existingForm.createdBy.toString() !== (req as any).user.id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to update this form",
      });
    }

    const updatedForm =
      await updateFormService(
        formId,
        result.data
      );

    return res.status(201).json({
      success: true,
      message:
        "New form version created",
      data: updatedForm,
    });
  } catch (error: any) {
    console.log(
      "UPDATE FORM ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error",
    });
  }
};

export const getForms = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    let filter = {};

    if (user.role === "admin") {
      filter = { createdBy: new mongoose.Types.ObjectId(user.id) };
    } else {
      filter = {
        allowedUsers: new mongoose.Types.ObjectId(user.id),
        isActive: true,
      };
    }

    const forms =
      await getFormsService(filter);

    return res.status(200).json({
      success: true,
      data: forms,
    });
  } catch (error: any) {
    console.log(
      "GET FORMS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error",
    });
  }
};

export const getFormById = async (
  req: Request,
  res: Response
) => {
  try {
    const formId = getStringId(
      req.params.id
    );

    const user = (req as any).user;

    const form =
      await getFormByIdService(
        formId
      );

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    // Access Check: Admins can see their own forms; users must be whitelisted
    if (user.role === "admin") {
      if (form.createdBy && form.createdBy.toString() !== user.id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: You do not own this form",
        });
      }
    } else {
      const isWhitelisted = form.allowedUsers?.some(
        (uid: any) => uid.toString() === user.id
      );
      if (!isWhitelisted) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized access: You are not whitelisted for this form",
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: form,
    });
  } catch (error: any) {
    console.log(
      "GET FORM ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error",
    });
  }
};

export const deleteForm = async (req: Request, res: Response) => {
  try {
    const formId = getStringId(req.params.id);

    const existingForm = await getFormByIdService(formId);
    if (!existingForm) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    // Verify creator
    if (existingForm.createdBy && existingForm.createdBy.toString() !== (req as any).user.id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to delete this form",
      });
    }

    const result = await deleteFormService(formId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};