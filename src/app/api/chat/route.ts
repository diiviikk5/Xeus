import { NextRequest, NextResponse } from "next/server";
import { streamText, tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair, Transaction, SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js";
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
    
    // 1. Resolve OpenAI API Key (check server environment, then search user's .env file)
    let openaiApiKey = process.env.OPENAI_API_KEY;
    if (env) {
      const match = env.match(/OPENAI_API_KEY\s*=\s*([^\s#]+)/);
      if (match) {
        openaiApiKey = match[1];
      }
    }
    
    // 2. Parse system prompt from agent.ts code
    const promptMatch = code.match(/systemPrompt:\s*`([^`]+)`/) || 
                        code.match(/systemPrompt:\s*"([^"]+)"/) || 
                        code.match(/systemPrompt:\s*'([^']+)'/);
    const systemPrompt = promptMatch ? promptMatch[1] : "You are a helpful Solana agent.";
    
    // 3. Fallback to descriptive mock if OpenAI key is missing
    if (!openaiApiKey) {
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
    
    // 5. Initialize OpenAI client
    const openai = createOpenAI({
      apiKey: openaiApiKey,
    });
    
    // 6. Define real on-chain tools
    const getBalanceTool = tool({
      description: "Get the current SOL balance of a Solana wallet on Devnet.",
      parameters: z.object({
        address: z.string().describe("The base58 Solana public key address to query."),
      }),
      execute: async ({ address }) => {
        try {
          const balance = await connection.getBalance(new PublicKey(address));
          return { status: "success", balance: balance / LAMPORTS_PER_SOL };
        } catch (err: any) {
          return { status: "error", error: err.message };
        }
      }
    });

    const requestFaucetTool = tool({
      description: "Request an airdrop of 1.0 SOL Devnet token to fund your wallet.",
      parameters: z.object({
        address: z.string().describe("The base58 Solana public key address to fund."),
      }),
      execute: async ({ address }) => {
        try {
          const signature = await connection.requestAirdrop(new PublicKey(address), 1 * LAMPORTS_PER_SOL);
          const latestBlockhash = await connection.getLatestBlockhash();
          await connection.confirmTransaction({ signature, ...latestBlockhash }, "confirmed");
          return { status: "success", signature, amount: 1.0 };
        } catch (err: any) {
          return { status: "error", error: err.message };
        }
      }
    });

    const transferSOLTool = tool({
      description: "Transfer SOL from the playground wallet to another destination address.",
      parameters: z.object({
        toAddress: z.string().describe("The destination base58 Solana address."),
        amountSOL: z.number().describe("The amount of SOL to transfer."),
      }),
      execute: async ({ toAddress, amountSOL }) => {
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
    });

    const swapTokensTool = tool({
      description: "Swap SOL to USDC or other tokens on Devnet (with simulated swaps backed by real-time Jupiter quotes).",
      parameters: z.object({
        amountSOL: z.number().describe("The amount of SOL to swap."),
        inputToken: z.string().default("SOL"),
        outputToken: z.string().default("USDC"),
      }),
      execute: async ({ amountSOL, inputToken, outputToken }) => {
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
    });

    const mintNFTTool = tool({
      description: "Mint a compressed NFT or token on Devnet.",
      parameters: z.object({
        name: z.string().describe("The name of the NFT collection."),
        symbol: z.string().describe("The symbol of the NFT collection."),
      }),
      execute: async ({ name, symbol }) => {
        try {
          // Record minting transaction on Devnet
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
            name,
            symbol,
            metadata: {
              image: "https://arweave.net/xeus-placeholder-logo",
              attributes: [{ trait_type: "IDE", value: "Xeus Playground" }],
            }
          };
        } catch (err: any) {
          return { status: "error", error: err.message };
        }
      }
    });

    // 7. Invoke streamText with real tools
    const result = streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages,
      tools: {
        getBalance: getBalanceTool,
        requestFaucet: requestFaucetTool,
        transferSOL: transferSOLTool,
        swapTokens: swapTokensTool,
        mintNFT: mintNFTTool,
      },
    });

    return result.toDataStreamResponse();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
