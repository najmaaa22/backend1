import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware"; // നിങ്ങളുടെ AuthRequest ടൈപ്പ് ഇമ്പോർട്ട് ചെയ്യുക

import {
  submitResponseService,
  getResponsesService,
  exportResponsesCSVService,
  getFormAnalyticsService,
  getMyResponseService,
} from "./response.service";

// ✅ GET USER'S PREVIOUS RESPONSE
export const getMyResponse = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const formId = req.params.id as string;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized - User details missing" });
    }

    const previousResponse = await getMyResponseService(formId, userId);

    return res.status(200).json({
      success: true,
      data: previousResponse,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ SUBMIT RESPONSE (Updated with Access and Quiz Constraints)
export const submitResponse = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userEmail = (req as any).user?.email; // ആക്സസ് ചെക്ക് ചെയ്യാൻ ഇമെയിൽ ആവശ്യമാണ്
    const formId = req.params.id as string;

    if (!userId || !userEmail) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized - Login session expired or missing" 
      });
    }

    // സർവീസിലേക്ക് formId, answers, userId, userEmail എന്നിവ പാസ് ചെയ്യുന്നു
    const response = await submitResponseService(
      formId,
      req.body.answers,
      userId,
      userEmail
    );

    return res.status(201).json({
      success: true,
      message: "Response submitted successfully",
      data: response,
    });
  } catch (error: any) {
    // സർവീസിൽ നിന്ന് വരുന്ന ബിസിനസ്സ് എററുകൾക്ക് കൃത്യമായ HTTP Status Codes നൽകുന്നു
    if (error.message === "UNAUTHORIZED_ACCESS") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this form/quiz.",
      });
    }

    if (error.message === "QUIZ_ALREADY_SUBMITTED") {
      return res.status(400).json({
        success: false,
        message: "You have already attempted this quiz. Multiple submissions are not allowed.",
      });
    }

    if (error.message === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "The requested form could not be found.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET RESPONSES
export const getResponses = async (req: Request, res: Response) => {
  try {
    const responses = await getResponsesService(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Responses fetched successfully",
      data: responses,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ EXPORT CSV
export const exportResponsesCSV = async (req: Request, res: Response) => {
  try {
    const csv = await exportResponsesCSVService(req.params.id as string);

    res.header("Content-Type", "text/csv");
    res.attachment(`form-${req.params.id}-responses.csv`);

    return res.send(csv);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ ANALYTICS
export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const analytics = await getFormAnalyticsService(req.params.id as string);

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};