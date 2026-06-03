import mongoose from "mongoose";

const FieldSchema =
  new mongoose.Schema(
    {
      fieldId: {
        type: String,
        required: true,
      },

      label: {
        type: String,
        required: true,
        trim: true,
      },

      type: {
        type: String,
        enum: [
          "text",
          "number",
          "textarea",
          "select",
          "radio",
          "checkbox",
          "date",
        ],
        required: true,
      },

      required: {
        type: Boolean,
        default: false,
      },

      options: {
        type: [String],
        default: [],
      },

      validation: {
        minLength: Number,

        maxLength: Number,

        pattern: String,
      },

      correctAnswer: {
        type:
          mongoose.Schema.Types.Mixed,
        default: null,
      },
    },

    {
      _id: false,
    }
  );

const FormSchema =
  new mongoose.Schema(
    {
      formGroupId: {
        type: String,
        required: true,
        index: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
      },

      description: {
        type: String,
        default: "",
      },

      isQuiz: {
        type: Boolean,
        default: false,
      },

      version: {
        type: Number,
        required: true,
        default: 1,
      },

      fields: {
        type: [FieldSchema],
        default: [],
      },

      allowedUsers: {
        type: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        }],
        default: [],
      },

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      isActive: {
        type: Boolean,
        default: true,
      },

      publishedAt: {
        type: Date,
        default: Date.now,
      },
    },

    {
      timestamps: true,
    }
  );

FormSchema.index({
  formGroupId: 1,
  version: -1,
});

FormSchema.index({
  formGroupId: 1,
  isActive: 1,
});

FormSchema.index({
  createdAt: -1,
});

export const Form =
  mongoose.models.Form ||
  mongoose.model(
    "Form",
    FormSchema
  );