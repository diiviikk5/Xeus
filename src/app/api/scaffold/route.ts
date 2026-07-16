import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export async function POST(req: NextRequest) {
  try {
    const { prompt, env } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Resolve OpenAI API Key (check server environment, then search user's .env file)
    let openaiApiKey = process.env.OPENAI_API_KEY;
    if (env) {
      const match = env.match(/OPENAI_API_KEY\s*=\s*([^\s#]+)/);
      if (match) {
        openaiApiKey = match[1];
      }
    }

    if (!openaiApiKey) {
      return NextResponse.json({
        error: "OpenAI API Key is missing. Please configure it in your environment or in the .env file in the playground.",
      }, { status: 400 });
    }

    const openai = createOpenAI({
      apiKey: openaiApiKey,
    });

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
      model: openai("gpt-4o"),
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
