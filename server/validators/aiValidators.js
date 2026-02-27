import { z } from 'zod';

export const generateTextSchema = z.object({
    prompt: z.string().min(1, 'Prompt is required'),
    tone: z.string().min(1, 'Tone is required'),
    model: z.string().min(1, 'Model is required'),
    length: z.string().min(1, 'Length is required'),
});
