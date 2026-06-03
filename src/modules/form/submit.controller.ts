import { Request, Response } from "express";
import { Form } from "./form.model";

import {
  createResponseService,
  getResponsesService,
  getAnalyticsService,
} from "./submit.service";

type AnswerValue = string | string[];
type AnswersMap = Record<string, AnswerValue>;

export const submitForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { answers, version } = req.body as {
      answers: AnswersMap;
      version: number;
    };

    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    let obtained = 0;
    let total = 0;

    if (form.isQuiz) {
      for (const field of form.fields as any[]) {
        if (field.correctAnswer == null) continue;

        total++;

        const rawSubmitted = answers?.[field.fieldId];
        const correct = field.correctAnswer;

        const submitted: string[] = Array.isArray(rawSubmitted)
          ? rawSubmitted.map(String)
          : rawSubmitted !== undefined
          ? [String(rawSubmitted)]
          : [];

        // multiple correct answers
        if (Array.isArray(correct)) {
          const correctArr = correct.map(String);

          const isCorrect =
            submitted.length === correctArr.length &&
            [...submitted].sort().join("|") ===
              [...correctArr].sort().join("|");

          if (isCorrect) obtained++;
        }

        // single correct answer
        else {
          const isCorrect =
            submitted[0]?.trim() === String(correct).trim();

          if (isCorrect) obtained++;
        }
      }
    }

    const response = await createResponseService({
      formId: id,
      version,
      answers,
      score: {
        obtained,
        total,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Response submitted",
      data: response,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};