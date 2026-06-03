import mongoose from "mongoose";

const ResponseSchema =
  new mongoose.Schema(
    {
      formId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Form",
        required: true,
      },

      version: {
        type: Number,
        default: 1,
      },

      answers: {
        type: Object,
        required: true,
      },

      score: {
        obtained: {
          type: Number,
          default: 0,
        },

        total: {
          type: Number,
          default: 0,
        },
      },
    },
    {
      timestamps: true,
    }
  );

export const Response =
  mongoose.models.Response ||
  mongoose.model(
    "Response",
    ResponseSchema
  );