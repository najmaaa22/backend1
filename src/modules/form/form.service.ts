import { Form, IForm } from "./form.model";
import mongoose from "mongoose";

type FormInput = {
  title: string;
  description?: string;
  isQuiz?: boolean;
  fields: any[];
  allowedUsers?: string[];
  createdBy: string;
  formGroupId?: string;
  version?: number;
};

//
// ================== CREATE FORM ==================
//
export const createFormService = async (data: FormInput): Promise<IForm> => {
  const formGroupId =
    data.formGroupId ||
    `form_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  const version = data.version || 1;

  const allowedUsersIds = (data.allowedUsers || []).map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  return await Form.create({
    ...data,
    allowedUsers: allowedUsersIds,
    createdBy: new mongoose.Types.ObjectId(data.createdBy),
    formGroupId,
    version,
    isActive: true,
    publishedAt: new Date(),
  });
};

//
// ================== GET FORMS ==================
//
export const getFormsService = async (filter: any = {}) => {
  const forms = await Form.aggregate([
    { $match: filter },

    // latest version first
    { $sort: { formGroupId: 1, version: -1 } },

    {
      $group: {
        _id: "$formGroupId",
        doc: { $first: "$$ROOT" },
      },
    },

    { $replaceRoot: { newRoot: "$doc" } },

    // final sorting
    { $sort: { createdAt: -1 } },
  ]);

  // ✅ ALWAYS RETURN ARRAY
  return forms || [];
};

//
// ================== GET FORM BY ID ==================
//
export const getFormByIdService = async (
  id: string
): Promise<IForm | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  return await Form.findById(id);
};

//
// ================== GET FORM VERSIONS ==================
//
export const getFormVersionsService = async (formGroupId: string) => {
  return await Form.find({ formGroupId }).sort({ version: -1 });
};

//
// ================== UPDATE FORM (VERSIONING) ==================
//
export const updateFormService = async (
  formId: string,
  data: FormInput
): Promise<IForm> => {
  const existingForm = await Form.findById(formId);

  if (!existingForm) {
    throw new Error("Form not found");
  }

  await Form.findByIdAndUpdate(formId, { isActive: false });

  const allowedUsersIds = (
    data.allowedUsers ||
    existingForm.allowedUsers ||
    []
  ).map((id: any) =>
    typeof id === "string" ? new mongoose.Types.ObjectId(id) : id
  );

  return await Form.create({
    title: data.title,
    description: data.description,
    isQuiz: data.isQuiz ?? existingForm.isQuiz,
    fields: data.fields,
    allowedUsers: allowedUsersIds,
    createdBy: existingForm.createdBy,
    formGroupId: existingForm.formGroupId,
    version: (existingForm.version || 1) + 1,
    isActive: true,
    publishedAt: new Date(),
  });
};

//
// ================== DELETE FORM (SOFT DELETE ALL VERSIONS) ==================
//
export const deleteFormService = async (formId: string) => {
  const form = await Form.findById(formId);

  if (!form) {
    throw new Error("Form not found");
  }

  await Form.updateMany(
    { formGroupId: form.formGroupId },
    { isActive: false }
  );

  return {
    message: "Form and all versions deactivated successfully",
    formGroupId: form.formGroupId,
  };
};

//
// ================== GET LATEST FORM ==================
//
export const getLatestFormService = async (
  formGroupId: string
): Promise<IForm | null> => {
  return await Form.findOne({
    formGroupId,
    isActive: true,
  }).sort({ version: -1 });
};