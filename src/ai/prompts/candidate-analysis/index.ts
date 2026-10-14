import { candidateAnalysisV1 } from "./v1";
import { candidateAnalysisV2 } from "./v2";

const versions = {
  "1.0.0": candidateAnalysisV1,
  "2.0.0": candidateAnalysisV2,
};

export const activeCandidateAnalysisPrompt = versions["1.0.0"];
