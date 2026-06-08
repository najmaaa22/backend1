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

// ✅ SUBMIT RESPONSE (Updated with 4 arguments to fix the TS error)
export const submitResponseService = async (
  formId: string,
  answers: Record<string, any>,
  userId: string,
  userEmail: string // 4th argument ആയി ഇമെയിൽ ഇവിടെ സ്വീകരിക്കുന്നു
) => {
  const form = await Form.findById(formId);
  if (!form) throw new Error("NOT_FOUND");

  // 1. Google Forms Style Whitelist Access Check (Using Email or User ID)
  // അഡ്മിൻ പബ്ലിക് ആക്കിയിട്ടില്ലെങ്കിൽ മാത്രം ചെക്ക് ചെയ്യുന്നു
  if (!(form as any).isPublic) {
    const isCreator = form.createdBy && form.createdBy.toString() === userId;
    
    // അഡ്മിൻ ഇൻപുട്ട് ചെയ്യുന്ന ലിസ്റ്റിൽ യൂസറുടെ ഇമെയിലോ ഐഡിയോ ഉണ്ടോ എന്ന് നോക്കുന്നു
    const isWhitelisted = form.allowedUsers?.some(
      (user: any) => user.toString() === userId || user.toString() === userEmail
    );

    if (!isCreator && !isWhitelisted) {
      throw new Error("UNAUTHORIZED_ACCESS");
    }
  }

  // 2. Single Submission Constraint Check
  const existingResponse = await Response.findOne({
    formGroupId: form.formGroupId,
    submittedBy: userId,
  });

  if (existingResponse && form.isQuiz) {
    throw new Error("QUIZ_ALREADY_SUBMITTED"); // ക്വിസ് ആണെങ്കിൽ അപ്ഡേറ്റ് ചെയ്യാൻ സമ്മതിക്കില്ല
  }

  // 3. Quiz Score Calculation
  let score;
  if (form.isQuiz) {
    let correct = 0;
    const breakdown: { fieldId: string; isCorrect: boolean }[] = [];

    form.fields.forEach((field: any) => {
      const userAnswer = answers[field.fieldId];
      const correctAnswer = field.correctAnswer;
      let isCorrect = false;

      if (Array.isArray(correctAnswer)) {
        const userArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        isCorrect =
          correctAnswer.length === userArray.length &&
          correctAnswer.every((a: string) => userArray.includes(a));
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

  // 4. If Normal Form, Update existing or Create New Response
  if (existingResponse) {
    existingResponse.formId = form._id as any;
    existingResponse.version = form.version;
    existingResponse.answers = answers;
    existingResponse.submittedAt = new Date();
    return await existingResponse.save();
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

// ✅ CSV EXPORT
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

// ✅ ANALYTICS
export const getFormAnalyticsService = async (formId: string) => {
  const responses = await Response.find({ formId });
  const totalResponses = responses.length;

  const quizResponses = responses.filter(
    (r) => r.score && r.score.total > 0
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