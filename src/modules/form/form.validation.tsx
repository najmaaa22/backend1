import { z } from "zod";

// Reusable field schema
const formFieldSchema = z.object({
  id: z.string().min(1, "Field ID is required"),
  label: z.string().min(3, "Field label must be at least 3 characters"),
  type: z.enum(["text", "number", "textarea", "select", "radio", "checkbox", "date"]),
  required: z.boolean().default(false),
  
  options: z.array(z.string().min(1)).optional(),
  
  validation: z.object({
    minLength: z.number().int().positive().optional(),
    maxLength: z.number().int().positive().optional(),
    pattern: z.string().optional(), // regex pattern as string
  }).optional(),

  correctAnswer: z.union([
    z.string(),
    z.array(z.string())
  ]).optional(),
}).refine((field) => {
  // Options required for select, radio, checkbox
  if (["select", "radio", "checkbox"].includes(field.type)) {
    return field.options && field.options.length > 0;
  }
  return true;
}, {
  message: "Options are required for select, radio, and checkbox fields",
  path: ["options"],
});

export const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  isQuiz: z.boolean().default(false),

  fields: z.array(formFieldSchema)
    .min(1, "At least one field is required")
    .max(50, "Maximum 50 fields allowed"),

  allowedUsers: z.array(z.string()).optional().default([]), // Array of User IDs
}).refine((data) => {
  // If it's a quiz, at least one field should have correctAnswer
  if (data.isQuiz) {
    return data.fields.some(field => field.correctAnswer !== undefined);
  }
  return true;
}, {
  message: "Quiz must have at least one field with a correct answer",
  path: ["isQuiz"],
}).refine((data) => {
  // Prevent correctAnswer in non-quiz forms
  if (!data.isQuiz) {
    return data.fields.every(field => field.correctAnswer === undefined);
  }
  return true;
}, {
  message: "Correct answers can only be set when isQuiz is true",
  path: ["fields"],
});

// Type inference
export type FormSchema = z.infer<typeof formSchema>;
export type FormField = z.infer<typeof formFieldSchema>;