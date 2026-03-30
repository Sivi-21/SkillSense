import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface SkillAnalysis {
  currentSkills: string[];
  requiredSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  gapAnalysis: string;
  roadmap: {
    week: string;
    topic: string;
    description: string;
    resources: { title: string; url: string }[];
  }[];
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (magA * magB);
}

export async function analyzeSkills(resumeText: string, targetRole: string): Promise<SkillAnalysis> {
  const model = "gemini-3-flash-preview";
  const embeddingModel = "gemini-embedding-2-preview";

  // 1. Knowledge Base: Retrieve Required Skills for Target Role
  const kbResponse = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: `List the top 10 essential technical and soft skills required for the role: ${targetRole}. Return as a simple comma-separated list.` }] }]
  });
  const requiredSkillsList = kbResponse.text || "";

  // 2. Embedding Engine: Convert Skills into Vectors
  const [currentEmbed, requiredEmbed] = await Promise.all([
    ai.models.embedContent({
      model: embeddingModel,
      contents: [resumeText]
    }),
    ai.models.embedContent({
      model: embeddingModel,
      contents: [requiredSkillsList]
    })
  ]);

  // 3. Gap Detection: Cosine Similarity
  const similarity = cosineSimilarity(
    currentEmbed.embeddings[0].values,
    requiredEmbed.embeddings[0].values
  );
  const matchPercentage = Math.round(similarity * 100);

  // 4. Learning Path Optimization (LLM)
  const prompt = `
    User Input (Current Skills): ${resumeText}
    Target Role: ${targetRole}
    Required Skills (Knowledge Base): ${requiredSkillsList}
    Skill Match Percentage (Cosine Similarity): ${matchPercentage}%

    Tasks:
    1. Extract specific current skills from the input.
    2. Identify the "missing" semantic concepts (The Gap).
    3. Generate a targeted 4-week learning roadmap to bridge this gap.
    4. Provide a reasoning for the gap analysis.

    Return the response in strict JSON format.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          currentSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          gapAnalysis: { type: Type.STRING },
          roadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                week: { type: Type.STRING },
                topic: { type: Type.STRING },
                description: { type: Type.STRING },
                resources: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      url: { type: Type.STRING }
                    },
                    required: ["title", "url"]
                  }
                }
              },
              required: ["week", "topic", "description", "resources"]
            }
          }
        },
        required: ["currentSkills", "requiredSkills", "missingSkills", "gapAnalysis", "roadmap"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate content");
  
  const result = JSON.parse(text);
  return { ...result, matchPercentage } as SkillAnalysis;
}
