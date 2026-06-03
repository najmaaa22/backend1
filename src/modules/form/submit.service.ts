import { Response } from "./submit.model";

export const createResponseService =
  async (data: any) => {
    return await Response.create(
      data
    );
  };

export const getResponsesService =
  async (formId: string) => {
    return await Response.find({
      formId,
    }).sort({
      createdAt: -1,
    });
  };

export const getAnalyticsService =
  async (formId: string) => {
    const responses =
      await Response.find({
        formId,
      });

    const totalResponses =
      responses.length;

    let totalScore = 0;

    let scoreCount = 0;

    responses.forEach((r: any) => {
      if (r.score?.total > 0) {
        totalScore +=
          (r.score.obtained /
            r.score.total) *
          100;

        scoreCount++;
      }
    });

    return {
      totalResponses,

      averageScore:
        scoreCount > 0
          ? Math.round(
              totalScore /
                scoreCount
            )
          : null,
    };
  };