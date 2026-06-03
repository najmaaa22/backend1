import { Request, Response } from "express";

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

// ✅ SUBMIT RESPONSE
export const submitResponse =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const response =
        await submitResponseService(
          req.params.id as string,
          req.body.answers,
          (req as any).user?.id
        );

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Response submitted successfully",

          data: response,
        });
    } catch (error: any) {
      return res
        .status(500)
        .json({
          success: false,

          message:
            error.message,
        });
    }
  };

// ✅ GET RESPONSES
export const getResponses =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const responses =
        await getResponsesService(
          req.params.id as string
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Responses fetched successfully",

          data: responses,
        });
    } catch (error: any) {
      return res
        .status(500)
        .json({
          success: false,

          message:
            error.message,
        });
    }
  };

// ✅ EXPORT CSV
export const exportResponsesCSV =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const csv =
        await exportResponsesCSVService(
          req.params.id as string
        );

      res.header(
        "Content-Type",
        "text/csv"
      );

      res.attachment(
        `form-${req.params.id}-responses.csv`
      );

      return res.send(csv);
    } catch (error: any) {
      return res
        .status(500)
        .json({
          success: false,

          message:
            error.message,
        });
    }
  };

// ✅ ANALYTICS
export const getAnalytics =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const analytics =
        await getFormAnalyticsService(
          req.params.id as string
        );

      return res
        .status(200)
        .json({
          success: true,

          data: analytics,
        });
    } catch (error: any) {
      return res
        .status(500)
        .json({
          success: false,

          message:
            error.message,
        });
    }
  };