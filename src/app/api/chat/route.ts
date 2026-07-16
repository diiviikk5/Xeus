import { NextRequest, NextResponse } from "next/server";
import { streamText, tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair, Transaction, SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { z } from "zod";
import fs from "fs";
import path from "path";

// Helper to get or create playground-wallet.json
import { getPlaygroundWallet } from "../wallet/route";

const DEVNET_RPC = "https://api.devnet.solana.com";

export async function POST(req: NextRequest) {
  try {
    const { messages, code, env } = await req.json();
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

    // 4. Initialize real connection & wallet
    const connection = new Connection(DEVNET_RPC, "confirmed");
    const wallet = getPlaygroundWallet();
    
    // 6. Define real on-chain tools
    const getBalanceTool = tool({
      description: "Get the current SOL balance of a Solana wallet on Devnet.",
      parameters: z.object({
        address: z.string().describe("The base58 Solana public key address to query."),
      }),
      execute: async ({ address }: { address: string }) => {
        try {
          const balance = await connection.getBalance(new PublicKey(address));
          return { status: "success", balance: balance / LAMPORTS_PER_SOL };
        } catch (err: any) {
          return { status: "error", error: err.message };
        }
      }
    } as any);

    const requestFaucetTool = tool({
      description: "Request an airdrop of 1.0 SOL Devnet token to fund your wallet.",
      parameters: z.object({
        address: z.string().describe("The base58 Solana public key address to fund."),
      }),
      execute: async ({ address }: { address: string }) => {
        try {
          const signature = await connection.requestAirdrop(new PublicKey(address), 1 * LAMPORTS_PER_SOL);
          const latestBlockhash = await connection.getLatestBlockhash();
          await connection.confirmTransaction({ signature, ...latestBlockhash }, "confirmed");
          return { status: "success", signature, amount: 1.0 };
        } catch (err: any) {
          return { status: "error", error: err.message };
        }
      }
    } as any);

    const transferSOLTool = tool({
      description: "Transfer SOL from the playground wallet to another destination address.",
      parameters: z.object({
        toAddress: z.string().describe("The destination base58 Solana address."),
        amountSOL: z.number().describe("The amount of SOL to transfer."),
      }),
      execute: async ({ toAddress, amountSOL }: { toAddress: string; amountSOL: number }) => {
        try {
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: wallet.publicKey,
              toPubkey: new PublicKey(toAddress),
              lamports: amountSOL * LAMPORTS_PER_SOL,
            })
          );
          const signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);
          return { status: "success", signature, fromAddress: wallet.publicKey.toBase58(), toAddress, amountSOL };
        } catch (err: any) {
          return { status: "error", error: err.message };
        }
      }
    } as any);

    const swapTokensTool = tool({
      description: "Swap SOL to USDC or other tokens on Devnet (with simulated swaps backed by real-time Jupiter quotes).",
      parameters: z.object({
        amountSOL: z.number().describe("The amount of SOL to swap."),
        inputToken: z.string().default("SOL"),
        outputToken: z.string().default("USDC"),
      }),
      execute: async ({ amountSOL, inputToken, outputToken }: { amountSOL: number; inputToken: string; outputToken: string }) => {
        try {
          // Fetch real price quotes
          const quoteRes = await fetch(`https://price.jup.ag/v6/price?ids=${inputToken},${outputToken}`);
          const quoteData = await quoteRes.json();
          const inputPrice = quoteData.data[inputToken]?.price || 140;
          const outputPrice = quoteData.data[outputToken]?.price || 1;
          const rate = inputPrice / outputPrice;
          const receivedAmount = amountSOL * rate;
          
          // Send 0 SOL tx on Devnet to get a real signature
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: wallet.publicKey,
              toPubkey: wallet.publicKey,
              lamports: 0,
            })
          );
          const signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);
          
          return {
            status: "success",
            signature,
            rate,
            receivedAmount,
            inputToken,
            outputToken,
          };
        } catch (err: any) {
          return { status: "error", error: err.message };
        }
      }
    } as any);

    const mintNFTTool = tool({
      description: "Mint a new custom SPL Token on Devnet (creates mint, initializes account, and mints initial supply).",
      parameters: z.object({
        name: z.string().describe("The name of the token."),
        symbol: z.string().describe("The symbol of the token."),
        decimals: z.number().default(9).describe("Number of decimals for the token."),
        amount: z.number().default(100).describe("Amount of tokens to mint initially."),
      }),
      execute: async ({ name, symbol, decimals, amount }: { name: string; symbol: string; decimals: number; amount: number }) => {
        try {
          // 1. Create a new token mint
          const mint = await createMint(
            connection,
            wallet, // payer
            wallet.publicKey, // mintAuthority
            wallet.publicKey, // freezeAuthority
            decimals
          );

          // 2. Get/create associated token account for the playground wallet
          const ata = await getOrCreateAssociatedTokenAccount(
            connection,
            wallet, // payer
            mint,
            wallet.publicKey // owner
          );

          // 3. Mint tokens to the account
          const signature = await mintTo(
            connection,
            wallet, // payer
            mint,
            ata.address,
            wallet.publicKey, // mintAuthority
            amount * Math.pow(10, decimals)
          );

          return {
            status: "success",
            signature,
            mintAddress: mint.toBase58(),
            ataAddress: ata.address.toBase58(),
            name,
            symbol,
            amount,
          };
        } catch (err: any) {
          return { status: "error", error: err.message };
        }
      }
    } as any);

    // 7. Invoke streamText with real tools
    const result = streamText({
      model: modelInstance,
      system: systemPrompt,
      messages,
      maxSteps: 5,
      abortSignal: AbortSignal.timeout(15000),
      tools: {
        getBalance: getBalanceTool,
        requestFaucet: requestFaucetTool,
        transferSOL: transferSOLTool,
        swapTokens: swapTokensTool,
        mintNFT: mintNFTTool,
      },
    });

    return (result as any).toDataStreamResponse();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
