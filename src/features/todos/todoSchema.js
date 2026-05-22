import { z } from "zod";

export const todoSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  completed: z.boolean().optional(),
});
