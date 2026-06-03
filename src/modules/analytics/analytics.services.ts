import { Response, IResponse } from "../responses/response.model";

export const getFormAnalytics = async (formId: string) => {
  const responses: IResponse[] = await Response.find({ formId })
    .select("score submittedAt")
    .sort({ submittedAt: -1 });

  const totalResponses = responses.length;

  const totalObtainedScore = responses.reduce((sum, r) => {
    return sum + (r.score?.obtained ?? 0);
  }, 0);

  const averageScore =
    totalResponses > 0
      ? Number((totalObtainedScore / totalResponses).toFixed(2))
      : 0;

  return {
    totalResponses,
    averageScore,
  };
};