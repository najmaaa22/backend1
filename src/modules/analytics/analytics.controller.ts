import { Request, Response } from "express";
import * as analyticsService from "./analytics.services";

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const formId = req.params.id as string;

    const data = await analyticsService.getFormAnalytics(formId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}; 