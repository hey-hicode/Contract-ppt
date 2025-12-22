import { NextResponse } from "next/server";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// Initialize OpenRouter client conditionally
const openrouter = process.env.OPENROUTER_API_KEY
  ? createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    })
  : null;

// Sample data for demo mode
const sampleAnalysisResult = {
  redFlags: [
    {
      type: "critical",
      title: "Unilateral Termination Clause",
      description:
        "Company can terminate the agreement at any time without notice.",
      clause:
        "Either party may terminate this Agreement at any time without notice.",
      recommendation:
        "Negotiate for mutual termination rights or a reasonable notice period.",
    },
    {
      type: "warning",
      title: "Broad Indemnification",
      description:
        "Client indemnifies Company even for Company's own negligence.",
      clause:
        "Client agrees to indemnify and hold harmless Company from any and all claims, damages, losses, and expenses, including attorney's fees, arising out of or relating to this Agreement, regardless of the cause or Company's negligence.",
      recommendation:
        "Limit indemnification to Client's actions and exclude Company's negligence.",
    },
    {
      type: "minor",
      title: "Vague Payment Terms",
      description:
        "Payment is due within a 'reasonable time' which is not clearly defined.",
      clause:
        "Client shall pay Company within a reasonable time after receiving an invoice.",
      recommendation:
        "Specify a clear payment deadline (e.g., 'within 30 days of invoice').",
    },
    {
      type: "critical",
      title: "Automatic Renewal with No Notice",
      description:
        "Agreement renews automatically without requiring prior notification to the client.",
      clause:
        "This Agreement automatically renews for successive one-year terms unless terminated.",
      recommendation:
        "Require written notice for renewal or allow client to opt-out before renewal.",
    },
    {
      type: "warning",
      title: "Unilateral Modification Rights",
      description:
        "Company can change terms without client's consent or notice.",
      clause:
        "Company reserves the right to modify the terms of this Agreement at any time, with or without notice to Client.",
      recommendation:
        "Require mutual agreement for modifications or at least prior written notice to Client.",
    },
  ],
  overallRisk: "high",
  summary:
    "This contract heavily favors the Company, containing several clauses that significantly disadvantage the Client. Key concerns include unilateral termination, broad indemnification, automatic renewal, and restrictive intellectual property and non-compete terms.",
  recommendations: [
    "Negotiate for more balanced termination clauses with reasonable notice periods.",
    "Limit indemnification scope to exclude Company's own negligence.",
    "Clarify vague payment terms with specific deadlines.",
    "Review automatic renewal clause to ensure clear opt-out rights.",
    "Require mutual agreement for contract modifications.",
  ],
};

// Simple function to create analysis from contract text
function createBasicAnalysis(contractText: string) {
  const redFlags = [];
  const recommendations = [];

  // Check for common problematic clauses
  if (
    contractText.toLowerCase().includes("terminate") &&
    contractText.toLowerCase().includes("without notice")
  ) {
    redFlags.push({
      type: "critical",
      title: "Termination Without Notice",
      description:
        "The contract allows termination without proper notice period.",
      clause: "Found termination clause without notice requirement",
      recommendation:
        "Negotiate for a reasonable notice period before termination.",
    });
    recommendations.push("Add termination notice requirements");
  }

  if (
    contractText.toLowerCase().includes("indemnify") ||
    contractText.toLowerCase().includes("hold harmless")
  ) {
    redFlags.push({
      type: "warning",
      title: "Indemnification Clause",
      description:
        "Contract contains indemnification requirements that may be broad.",
      clause: "Found indemnification language in contract",
      recommendation: "Review and limit the scope of indemnification clauses.",
    });
    recommendations.push("Review indemnification scope");
  }

  if (
    contractText.toLowerCase().includes("automatically renew") ||
    contractText.toLowerCase().includes("auto-renew")
  ) {
    redFlags.push({
      type: "warning",
      title: "Automatic Renewal",
      description: "Contract may automatically renew without explicit consent.",
      clause: "Found automatic renewal language",
      recommendation: "Ensure clear opt-out procedures for automatic renewal.",
    });
    recommendations.push("Clarify renewal procedures");
  }

  if (
    contractText.toLowerCase().includes("reasonable time") &&
    contractText.toLowerCase().includes("pay")
  ) {
    redFlags.push({
      type: "minor",
      title: "Vague Payment Terms",
      description: "Payment terms use vague language like 'reasonable time'.",
      clause: "Payment due within reasonable time",
      recommendation: "Specify exact payment deadlines (e.g., 30 days).",
    });
    recommendations.push("Specify payment deadlines");
  }

  // Determine overall risk
  const criticalCount = redFlags.filter(
    (flag) => flag.type === "critical"
  ).length;
  const warningCount = redFlags.filter(
    (flag) => flag.type === "warning"
  ).length;

  let overallRisk = "low";
  if (criticalCount > 0) {
    overallRisk = "high";
  } else if (warningCount > 1) {
    overallRisk = "medium";
  }

  // If no specific issues found, add some general ones
  if (redFlags.length === 0) {
    redFlags.push({
      type: "minor",
      title: "General Review Needed",
      description:
        "Contract should be reviewed for standard legal protections.",
      clause: "Overall contract structure",
      recommendation:
        "Have a legal professional review all terms and conditions.",
    });
    recommendations.push("Conduct comprehensive legal review");
  }

  return {
    redFlags,
    overallRisk,
    summary: `Contract analysis completed. Found ${
      redFlags.length
    } potential issues requiring attention. ${
      criticalCount > 0
        ? "Critical issues detected that need immediate attention."
        : warningCount > 0
        ? "Some concerning clauses identified."
        : "Minor issues noted for consideration."
    }`,
    recommendations:
      recommendations.length > 0
        ? recommendations
        : [
            "Conduct thorough legal review",
            "Clarify ambiguous terms",
            "Ensure balanced rights and obligations",
          ],
  };
}

export async function POST(req: Request) {
  try {
    const { action, payload } = await req.json();

    if (action === "analyze") {
      const { contractText } = payload;

      if (!contractText) {
        return NextResponse.json(
          { error: "Contract text is required." },
          { status: 400 }
        );
      }

      // If no OpenRouter API key, return sample data
      if (!openrouter) {
        console.log("No OpenRouter API key found, using sample data");
        return NextResponse.json(sampleAnalysisResult, { status: 200 });
      }

      try {
        console.log("Attempting AI analysis...");

        const { text } = await generateText({
          model: openrouter("openai/gpt-4o-mini"), // Using mini model for better reliability
          system: `You are a legal contract analyzer. Respond with ONLY a valid JSON object in this exact format:

{
  "redFlags": [
    {
      "type": "critical",
      "title": "Issue Title",
      "description": "Why this is problematic",
      "clause": "Exact text from contract",
      "recommendation": "How to fix it"
    }
  ],
  "overallRisk": "low",
  "summary": "Brief contract summary",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}

Rules:
- type must be "critical", "warning", or "minor"
- overallRisk must be "low", "medium", or "high"
- Include 2-5 red flags maximum
- Keep descriptions concise
- No markdown, no explanations, just JSON`,
          prompt: `Analyze this contract for red flags:\n\n${contractText.substring(
            0,
            3000
          )}`, // Limit input length
          // maxTokens: 2000,

          temperature: 0.1, // Lower temperature for more consistent output
        });

        console.log("AI response received, length:", text.length);
        console.log("First 200 chars:", text.substring(0, 200));

        // Clean the response
        let cleanedText = text.trim();

        // Remove any markdown formatting
        cleanedText = cleanedText
          .replace(/```json\s*/g, "")
          .replace(/```\s*/g, "");

        // Find the JSON object
        const startIndex = cleanedText.indexOf("{");
        const endIndex = cleanedText.lastIndexOf("}");

        if (startIndex === -1 || endIndex === -1) {
          throw new Error("No JSON object found in response");
        }

        cleanedText = cleanedText.substring(startIndex, endIndex + 1);

        console.log("Cleaned JSON:", cleanedText.substring(0, 200));

        // Parse JSON
        let analysisResult;
        try {
          analysisResult = JSON.parse(cleanedText);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          throw new Error("Invalid JSON format");
        }

        // Validate structure
        if (
          !analysisResult.redFlags ||
          !Array.isArray(analysisResult.redFlags)
        ) {
          throw new Error("Invalid redFlags structure");
        }

        if (
          !analysisResult.overallRisk ||
          !["low", "medium", "high"].includes(analysisResult.overallRisk)
        ) {
          throw new Error("Invalid overallRisk value");
        }

        console.log("AI analysis successful");
        return NextResponse.json(analysisResult, { status: 200 });
      } catch (aiError: unknown) {
        const msg = aiError instanceof Error ? aiError.message : String(aiError);
        console.error("AI analysis failed:", msg);

        // Fallback to basic analysis
        console.log("Using fallback basic analysis");
        const basicAnalysis = createBasicAnalysis(contractText);
        return NextResponse.json(basicAnalysis, { status: 200 });
      }
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: unknown) {
    console.error("Contract analysis error:", error);

    // Ultimate fallback
    console.log("Using ultimate fallback - sample data");
    return NextResponse.json(sampleAnalysisResult, { status: 200 });
  }
}
