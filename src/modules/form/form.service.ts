import { Form } from "./form.model";

type FormInput = {
  title: string;
  description?: string;
  isQuiz?: boolean;
  fields: any[];
};

export const createFormService = async (data: any) => {
  const formGroupId = data.formGroupId || crypto.randomUUID();
  const version = data.version || 1;

  return await Form.create({
    ...data,
    formGroupId,
    version,
    isActive: true,
    publishedAt: new Date(),
  });
};

export const getFormsService = async (filter: any = {}) => {
  return await Form.aggregate([
    {
      $match: filter,
    },
    {
      $sort: { version: -1 },
    },
    {
      $group: {
        _id: "$formGroupId",
        doc: { $first: "$$ROOT" },
      },
    },
    {
      $replaceRoot: { newRoot: "$doc" },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);
};

export const getFormVersionsService = async (formGroupId: string) => {
  return await Form.find({ formGroupId }).sort({ version: -1 });
};

export const getFormByIdService = async (id: string) => {
  return await Form.findById(id);
};

export const updateFormService = async (formId: string, data: any) => {
  const existingForm = await Form.findById(formId);

  if (!existingForm) {
    throw new Error("Form not found");
  }

  await Form.findByIdAndUpdate(formId, {
    isActive: false,
  });

  const newVersion = await Form.create({
    title: data.title,
    description: data.description,
    isQuiz: data.isQuiz,
    fields: data.fields,
    allowedUsers: data.allowedUsers || existingForm.allowedUsers,
    createdBy: existingForm.createdBy,
    formGroupId: existingForm.formGroupId,
    version: (existingForm.version || 1) + 1,
    isActive: true,
    publishedAt: new Date(),
  });

  return newVersion;
};

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
    message: "Form deleted successfully",
  };
};