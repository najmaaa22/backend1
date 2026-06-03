import { Response } from "./response.model";
import { Form } from "../form/form.model";
import { Parser } from "json2csv";

// ✅ GET USER'S PREVIOUS RESPONSE
export const getMyResponseService = async (formId: string, userId: string) => {
  const form = await Form.findById(formId);
  if (!form) throw new Error("Form not found");

  return await Response.findOne({
    formGroupId: form.formGroupId,
    submittedBy: userId,
  });
};

// ✅ SUBMIT RESPONSE
export const submitResponseService = async (
  formId: string,
  answers: Record<string, any>,
  userId?: string
) => {
  const form = await Form.findById(formId);

  if (!form) throw new Error("Form not found");

  // Whitelist Access Check
  if (userId) {
    const isCreator = form.createdBy && form.createdBy.toString() === userId;
    const isWhitelisted = form.allowedUsers?.some(
      (uid: any) => uid.toString() === userId
    );

    if (!isCreator && !isWhitelisted) {
      throw new Error("Unauthorized: You are not whitelisted for this form");
    }
  }

  let score;

  if (form.isQuiz) {
    let correct = 0;

    const breakdown: { fieldId: string; isCorrect: boolean }[] = [];

    form.fields.forEach((field: any) => {
      const userAnswer = answers[field.fieldId];
      const correctAnswer = field.correctAnswer;

      let isCorrect = false;

      if (Array.isArray(correctAnswer)) {
        const userArray = Array.isArray(userAnswer)
          ? userAnswer
          : [userAnswer];

        isCorrect =
          correctAnswer.length === userArray.length &&
          correctAnswer.every((a: string) =>
            userArray.includes(a)
          );
      } else {
        isCorrect =
          String(userAnswer ?? "").trim().toLowerCase() ===
          String(correctAnswer ?? "").trim().toLowerCase();
      }

      if (isCorrect) correct++;

      breakdown.push({
        fieldId: field.fieldId,
        isCorrect,
      });
    });

    score = {
      obtained: correct,
      total: form.fields.length,
      breakdown,
    };
  }

  // Single Submission Constraint Check
  if (userId) {
    const existingResponse = await Response.findOne({
      formGroupId: form.formGroupId,
      submittedBy: userId,
    });

    if (existingResponse) {
      if (form.isQuiz) {
        throw new Error("Quizzes can only be completed once. Updates are not allowed.");
      }

      // If it is a form, update the previous response and bump its linked version reference
      existingResponse.formId = form._id;
      existingResponse.version = form.version;
      existingResponse.answers = answers;
      existingResponse.submittedAt = new Date();

      return await existingResponse.save();
    }
  }

  return await Response.create({
    formId: form._id,
    formGroupId: form.formGroupId,
    version: form.version,
    answers,
    score,
    submittedBy: userId || null,
    submittedAt: new Date(),
  });
};

// ✅ GET RESPONSES
export const getResponsesService = async (formId: string) => {
  return await Response.find({ formId }).sort({ submittedAt: -1 });
};

// ✅ GROUP RESPONSES
export const getResponsesByGroupService = async (formGroupId: string) => {
  return await Response.find({ formGroupId }).sort({ submittedAt: -1 });
};

// ✅ CSV EXPORT (FIXED)
export const exportResponsesCSVService = async (formId: string) => {
  const form = await Form.findById(formId);
  if (!form) throw new Error("Form not found");

  const responses = await Response.find({ formId });
  if (!responses.length) throw new Error("No responses found");

  const fields = [
    { label: "Response ID", value: "_id" },
    { label: "Version", value: "version" },
    { label: "Submitted At", value: "submittedAt" },

    ...form.fields.map((field: any) => ({
      label: field.label,
      value: (row: any) => {
        const ans = row.answers?.[field.fieldId];
        return Array.isArray(ans) ? ans.join(", ") : ans ?? "";
      },
    })),

    ...(form.isQuiz
      ? [
          {
            label: "Score",
            value: (row: any) =>
              `${row.score?.obtained ?? 0}/${row.score?.total ?? 0}`,
          },
        ]
      : []),
  ];

  const parser = new Parser({ fields });

  return parser.parse(responses);
};

// ✅ ANALYTICS (FIXED)
export const getFormAnalyticsService = async (formId: string) => {
  const responses = await Response.find({ formId });

  const totalResponses = responses.length;

  const quizResponses = responses.filter(
    (r) => r.score?.total > 0
  );

  const averageScore =
    quizResponses.length > 0
      ? quizResponses.reduce(
          (sum, r) =>
            sum +
            ((r.score?.obtained || 0) / (r.score?.total || 1)) * 100,
          0
        ) / quizResponses.length
      : 0;

  return {
    totalResponses,
    averageScore: Number(averageScore.toFixed(2)),
  };
};