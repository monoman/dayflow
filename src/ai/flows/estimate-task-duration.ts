'use server';

/**
 * @fileOverview This file defines a Genkit flow for estimating the duration of a task.
 *
 * estimateTaskDuration - Estimates the duration of a task based on its description.
 * EstimateTaskDurationInput - The input type for the estimateTaskDuration function.
 * EstimateTaskDurationOutput - The return type for the estimateTaskDuration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateTaskDurationInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The description of the task for which to estimate the duration.'),
});

export type EstimateTaskDurationInput = z.infer<
  typeof EstimateTaskDurationInputSchema
>;

const EstimateTaskDurationOutputSchema = z.object({
  estimatedDurationMinutes: z
    .number()
    .describe('The estimated duration of the task in minutes.'),
});

export type EstimateTaskDurationOutput = z.infer<
  typeof EstimateTaskDurationOutputSchema
>;

export async function estimateTaskDuration(
  input: EstimateTaskDurationInput
): Promise<EstimateTaskDurationOutput> {
  return estimateTaskDurationFlow(input);
}

const estimateTaskDurationPrompt = ai.definePrompt({
  name: 'estimateTaskDurationPrompt',
  input: {schema: EstimateTaskDurationInputSchema},
  output: {schema: EstimateTaskDurationOutputSchema},
  prompt: `You are a time management expert. Please estimate the duration in minutes for the following task:

Task Description: {{{taskDescription}}}

Provide only the number of minutes. Do not include any other text.`,
});

const estimateTaskDurationFlow = ai.defineFlow(
  {
    name: 'estimateTaskDurationFlow',
    inputSchema: EstimateTaskDurationInputSchema,
    outputSchema: EstimateTaskDurationOutputSchema,
  },
  async input => {
    const {output} = await estimateTaskDurationPrompt(input);
    return output!;
  }
);
