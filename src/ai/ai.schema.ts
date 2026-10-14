import { z } from "zod";

export const candidateAnalysisSchema = z.object({
  matchScore: z.number().int().min(0).max(100),

  strengths: z.array(z.string()),

  missingSkills: z.array(z.string()),

  recommendation: z.enum(["strong_match", "potential_match", "poor_match"]),
});

export type CandidateAnalysis = z.infer<typeof candidateAnalysisSchema>;
