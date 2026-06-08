
import mongoose, { Schema, Document } from "mongoose";

export interface IForm extends Document {
  title: string;
  description?: string;
  isQuiz: boolean;
  fields: any[];
  allowedUsers: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  formGroupId: string;
  version: number;
  isActive: boolean;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const formSchema = new Schema<IForm>(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    isQuiz: {
      type: Boolean,
      default: false,
    },

    fields: [
      {
        fieldId: String,
        label: String,
        type: String,
        required: Boolean,
        options: [String],
        correctAnswer: Schema.Types.Mixed,
      },
    ],

    allowedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    formGroupId: {
      type: String,
      required: true,
    },

    version: {
      type: Number,
      default: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Form = mongoose.model<IForm>(
  "Form",
  formSchema
);

export default Form;

