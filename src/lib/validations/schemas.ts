import { z } from "zod";

export const WeightEntryInputSchema = z.object({
  weightKg: z
    .number({ error: "Weight must be a valid number" })
    .min(15, { message: "Weight must be at least 15 kg (33 lbs)" })
    .max(450, { message: "Weight must be under 450 kg (990 lbs)" }),
  recordedAt: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : new Date())),
  note: z.string().max(300, "Notes cannot exceed 300 characters").optional().default(""),
});

export const WeightEntryUpdateSchema = z.object({
  weightKg: z
    .number()
    .min(15, { message: "Weight must be at least 15 kg (33 lbs)" })
    .max(450, { message: "Weight must be under 450 kg (990 lbs)" })
    .optional(),
  recordedAt: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  note: z.string().max(300).optional(),
});

export const FitnessGoalInputSchema = z.object({
  goalType: z.enum(["lose", "gain", "maintain"], {
    error: "Goal type must be lose, gain, or maintain",
  }),
  startingWeightKg: z
    .number()
    .min(15, "Starting weight must be at least 15 kg")
    .max(450, "Starting weight must be under 450 kg"),
  targetWeightKg: z
    .number()
    .min(15, "Target weight must be at least 15 kg")
    .max(450, "Target weight must be under 450 kg"),
  status: z.enum(["active", "completed", "abandoned"]).optional().default("active"),
});

export const UserProfileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  heightCm: z.number().min(50).max(260).optional(),
  preferredUnit: z.enum(["kg", "lbs"]).optional(),
  timezone: z.string().max(60).optional(),
});

export type WeightEntryInput = z.infer<typeof WeightEntryInputSchema>;
export type WeightEntryUpdate = z.infer<typeof WeightEntryUpdateSchema>;
export type FitnessGoalInput = z.infer<typeof FitnessGoalInputSchema>;
export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>;
