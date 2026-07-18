import { NextRequest, NextResponse } from "next/server";
import { streamText, tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";
import { SolanaAgentKit, KeypairWallet, executeAction } from "solana-agent-kit";
import { z } from "zod";
import fs from "fs";
import path from "path";

// Helper to get or create playground-wallet.json
import { getPlaygroundWallet } from "../wallet/route";

const DEVNET_RPC = "https://api.devnet.solana.com";

export async function POST(req: NextRequest) {
  try {
    const { messages, code, env, privateKey, rpcUrl } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";
    
    // 1. Resolve Provider and API Key
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

    let modelInstance: any = null;

    if (apiKey) {
      if (!modelName) {
        if (provider === "openai") modelName = "gpt-4o";
        else if (provider === "anthropic") modelName = "claude-3-5-sonnet-20241022";
        else if (provider === "google") modelName = "gemini-2.5-flash";
      }

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
        throw new Error(`Unsupported AI provider: ${provider}`);
      }
    }
    
    // 2. Parse system prompt from agent.ts code
    const promptMatch = code.match(/systemPrompt:\s*`([^`]+)`/) || 
                        code.match(/systemPrompt:\s*"([^"]+)"/) || 
                        code.match(/systemPrompt:\s*'([^']+)'/);
    const systemPrompt = promptMatch ? promptMatch[1] : "You are a helpful Solana agent.";
    
    // 3. Fallback to descriptive mock if AI key is missing
    if (!apiKey) {
      const connection = new Connection(DEVNET_RPC, "confirmed");
      const wallet = getPlaygroundWallet();
      let balance = 0;
      try {
        balance = await connection.getBalance(wallet.publicKey) / LAMPORTS_PER_SOL;
      } catch (e) {}
      
      const response = `[XEUS PLAYGROUND DETECTED]
Please add your OPENAI_API_KEY in the editor's \`.env\` file (or in your server environment variables) to activate live on-chain AI agent execution.

**Your Playground Wallet Info:**
* Public Key: \`${wallet.publicKey.toBase58()}\`
* Real Devnet Balance: \`${balance.toFixed(2)} SOL\`

*(Note: You can request more SOL using the Faucet button at the bottom.)*`;

      // Create a mock stream to explain how to get started
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const words = response.split(" ");
          for (const word of words) {
            controller.enqueue(encoder.encode(`0:"${word} "\n`));
            await new Promise((resolve) => setTimeout(resolve, 20));
          }
          controller.close();
        }
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    // 4. Initialize SolanaAgentKit Core Runtime
    const resolvedRpcUrl = rpcUrl || DEVNET_RPC;
    const wallet = getPlaygroundWallet(privateKey);
    const keypairWallet = new KeypairWallet(wallet, resolvedRpcUrl);
    const agentInstance = new SolanaAgentKit(
      keypairWallet,
      resolvedRpcUrl,
      {
        OPENAI_API_KEY: provider === "openai" ? apiKey : undefined
      }
    );

    // 5. Dynamic mapping of SAK Actions to Vercel AI SDK CoreTools
    const SAKTools: Record<string, any> = {};
    for (const action of agentInstance.actions) {
      // Normalize names to prevent invalid characters in Vercel AI SDK keys
      const toolName = action.name.replace(/[^a-zA-Z0-9_]/g, "_");
      SAKTools[toolName] = tool({
        description: `${action.description}\n\nSchema: ${action.schema ? JSON.stringify(action.schema) : "None"}`,
        parameters: action.schema || z.object({}),
        execute: async (params: any) => {
          try {
            return await executeAction(action, agentInstance, params);
          } catch (err: any) {
            return { status: "error", error: err.message };
          }
        }
      } as any);
    }

    // 6. Invoke streamText using the mapped SolanaAgentKit tools
    const result = streamText({
      model: modelInstance,
      system: systemPrompt,
      messages,
      abortSignal: AbortSignal.timeout(25000), // Longer timeout for SAK on-chain confirmations
      tools: SAKTools,
    });

    return (result as any).toDataStreamResponse();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
