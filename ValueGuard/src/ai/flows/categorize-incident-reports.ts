'use server';

/**
 * @fileOverview This file contains a Genkit flow for categorizing incident reports.
 *
 * It exports:
 * - `categorizeIncident`: A function that takes an incident report as input and returns suggested categories.
 * - `CategorizeIncidentInput`: The input type for the categorizeIncident function.
 * - `CategorizeIncidentOutput`: The output type for the categorizeIncident function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeIncidentInputSchema = z.object({
  report: z
    .string()
    .describe('The incident report to categorize.'),
});
export type CategorizeIncidentInput = z.infer<typeof CategorizeIncidentInputSchema>;

const CategorizeIncidentOutputSchema = z.object({
  categories: z
    .array(z.string())
    .describe('An array of suggested categories for the incident report.'),
});
export type CategorizeIncidentOutput = z.infer<typeof CategorizeIncidentOutputSchema>;

export async function categorizeIncident(input: CategorizeIncidentInput): Promise<CategorizeIncidentOutput> {
  return categorizeIncidentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeIncidentPrompt',
  input: {schema: CategorizeIncidentInputSchema},
  output: {schema: CategorizeIncidentOutputSchema},
  prompt: `You are an AI assistant that categorizes incident reports into relevant categories.

  Given the following incident report, suggest the top 3 most relevant categories. Respond with only the category names, each separated by a comma.

  Incident Report: {{{report}}}
  `,
});

const categorizeIncidentFlow = ai.defineFlow(
  {
    name: 'categorizeIncidentFlow',
    inputSchema: CategorizeIncidentInputSchema,
    outputSchema: CategorizeIncidentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output?.categories) {
      throw new Error('No categories returned from prompt.');
    }
    // split the categories string, trim whitespace, and remove empty strings
    const categories = output.categories
      .split(',')
      .map(category => category.trim())
      .filter(category => category !== '');

    return {categories};
  }
);
