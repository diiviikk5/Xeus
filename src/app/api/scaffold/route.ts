import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export async function POST(req: NextRequest) {
  try {
    const { prompt, env } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Resolve Provider and API Key
    let provider = "openai";
    let apiKey = "";
    let modelName = "";

    if (env) {
      const providerMatch = env.match(/AI_PROVIDER\s*=\s*([^\s#]+)/);
      const keyMatch = env.match(/AI_API_KEY\s*=\s*([^\s#]+)/);
      const modelMatch = env.match(/AI_MODEL\s*=\s*([^\s#]+)/);

      if (providerMatch) provider = providerMatch[1];
      if (keyMatch) apiKey = keyMatch[1];
      if (modelMatch) modelName = modelMatch[1];

      // Auto-fallback mapping for standard API keys in env editor
      if (!apiKey) {
        const openaiMatch = env.match(/OPENAI_API_KEY\s*=\s*([^\s#]+)/);
        const anthropicMatch = env.match(/ANTHROPIC_API_KEY\s*=\s*([^\s#]+)/);
        const geminiMatch = env.match(/GEMINI_API_KEY\s*=\s*([^\s#]+)/);

        if (openaiMatch) {
          provider = "openai";
          apiKey = openaiMatch[1];
        } else if (anthropicMatch) {
          provider = "anthropic";
          apiKey = anthropicMatch[1];
        } else if (geminiMatch) {
          provider = "google";
          apiKey = geminiMatch[1];
        }
      }
    }

    if (!apiKey) {
      if (process.env.OPENAI_API_KEY) {
        provider = "openai";
        apiKey = process.env.OPENAI_API_KEY;
      } else if (process.env.ANTHROPIC_API_KEY) {
        provider = "anthropic";
        apiKey = process.env.ANTHROPIC_API_KEY;
      } else if (process.env.GEMINI_API_KEY) {
        provider = "google";
        apiKey = process.env.GEMINI_API_KEY;
      }
    }

    if (!apiKey) {
      return NextResponse.json({
        error: "No API Key detected. Please configure your key in Workspace Settings (Settings button) or define it in your .env file.",
      }, { status: 400 });
    }

    if (!modelName) {
      if (provider === "openai") modelName = "gpt-4o";
      else if (provider === "anthropic") modelName = "claude-3-5-sonnet-20241022";
      else if (provider === "google") modelName = "gemini-2.5-flash";
    }

    let modelInstance: any;
    if (provider === "openai") {
      const client = createOpenAI({ apiKey });
      modelInstance = client(modelName);
    } else if (provider === "anthropic") {
      const client = createAnthropic({ apiKey });
      modelInstance = client(modelName);
    } else if (provider === "google") {
      const client = createGoogleGenerativeAI({ apiKey });
      modelInstance = client(modelName);
    } else {
      return NextResponse.json({ error: `Unsupported AI provider: ${provider}` }, { status: 400 });
    }

    const systemInstruction = `You are an AI assistant built inside the Xeus Solana Agent IDE.
Your task is to take a natural language description of a Solana AI agent and translate it into a valid, beautiful, and complete TypeScript configuration matching the Xeus agent.ts format.

Rules for output code:
1. It MUST import from "@solana/agent-kit" (even if simulated).
2. It MUST export a const named "config" with: name, model, version, plugins (array of token, defi, nft, jupiter, governance, etc.), systemPrompt (a detailed prompt explaining the agent's role, constraints, and how to execute the user's requested actions), and constraints.
3. Keep the code clean, well-commented, and valid TypeScript.
4. Output ONLY the code itself. Do not include markdown code block backticks (\`\`\`typescript ... \`\`\`).
5. Ensure the systemPrompt instructs the agent to utilize available on-chain tools (getBalance, requestFaucet, transferSOL, swapTokens, mintNFT) to carry out the user's goal.

Example Output format:
import { SolanaAgentKit, createSolanaTools } from "@solana/agent-kit";

export const config = {
  name: "Arbitrage Sniper",
  model: "gpt-4o",
  version: "1.0.0",
  plugins: ["defi", "jupiter"],
  systemPrompt: "You scan Jupiter liquidity pools...",
  constraints: {
    maxTxSOL: 1.0,
    maxTxPerHour: 10,
    allowedActions: ["trade", "swap"]
  }
};`;

    const { text } = await generateText({
      model: modelInstance,
      system: systemInstruction,
      prompt: `Generate a TypeScript agent config for: "${prompt}"`,
    });

    // Clean up response if the model included backticks
    let code = text.trim();
    if (code.startsWith("```")) {
      code = code.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "");
    }

    return NextResponse.json({ code });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
