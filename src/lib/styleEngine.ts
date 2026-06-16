import { StudioStyleProfile } from '../types';

export const EMPTY_STYLE_PROFILE: StudioStyleProfile = {
  tone: {
    formality: 'professional',
    sentenceLength: 'medium',
    paragraphSize: 'regular',
    voice: 'active'
  },
  vocabulary: {
    technicalExpressions: [],
    preferredWording: [],
    recurringPhrases: [],
    commonDisclaimers: []
  },
  structure: {
    sectionNaming: [],
    numberingStyle: 'numeric (1, 1.1)',
    headingStyle: 'sentence case',
    signatureFormat: 'Standard'
  },
  legal: {
    responsibilityClauses: [],
    exclusionClauses: [],
    intellectualProperty: []
  }
};

/**
 * Analyzes studio documents to extract a style profile by calling the server-side API.
 */
export async function analyzeStudioStyle(contents: string[]): Promise<{ profile: StudioStyleProfile; confidence: number }> {
  if (!contents || contents.length === 0) {
    return { profile: EMPTY_STYLE_PROFILE, confidence: 0 };
  }

  try {
    const response = await fetch("/api/analyze-style", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      throw new Error("Failed to analyze style via server.");
    }

    const data = await response.json();
    const resultText = data.text;
    
    // Extract JSON from markdown if necessary
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        profile: {
          tone: parsed.tone,
          vocabulary: parsed.vocabulary,
          structure: parsed.structure,
          legal: parsed.legal
        },
        confidence: Number.isFinite(parsed.confidenceScore) ? parsed.confidenceScore : Math.min(contents.length * 20, 95)
      };
    }
  } catch (err) {
    console.error("Style analysis failed:", err);
  }

  return { 
    profile: EMPTY_STYLE_PROFILE, 
    confidence: Math.min(contents.length * 15, 60) // Fallback confidence
  };
}
