import { NextRequest } from "next/server";

// Simple custom text streamer in Vercel AI SDK message format
function createMockStream(responseContent: string, toolCall?: { name: string; args: Record<string, unknown> }) {
  const encoder = new TextEncoder();
  
  return new ReadableStream({
    async start(controller) {
      // Stream content chunks slowly to simulate real streaming
      const words = responseContent.split(" ");
      let currentText = "";
      
      // Vercel AI SDK data protocol prefixes:
      // '0' for text chunks
      // 'a' for tool calls (or we can inject them as message attachments/metadata)
      
      for (const word of words) {
        currentText += word + " ";
        // Send a text chunk
        const textPayload = `0:"${word} "\n`;
        controller.enqueue(encoder.encode(textPayload));
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      
      // Inject simulated tool calls if requested
      if (toolCall) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const toolCallId = "call_" + Math.random().toString(36).substr(2, 9);
        
        // Vercel AI SDK tool call format in stream protocol:
        // '9' for tool calls: 9:{"toolCalls":[{"id":"...","type":"function","function":{"name":"...","arguments":"..."}}]}
        const toolPayload = `9:{"toolCalls":[{"id":"${toolCallId}","type":"function","function":{"name":"${toolCall.name}","arguments":${JSON.stringify(JSON.stringify(toolCall.args))}}]}\n`;
        controller.enqueue(encoder.encode(toolPayload));
        
        // Stream the tool call results block:
        // 'a' for tool result: a:{"toolResults":[{"id":"...","result":"..."}]}
        await new Promise((resolve) => setTimeout(resolve, 800));
        const resultPayload = `a:{"toolResults":[{"id":"${toolCallId}","result":"success","txHash":"4d2za37fg8wP"}]}\n`;
        controller.enqueue(encoder.encode(resultPayload));
      }

      controller.close();
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { messages, code } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";
    const prompt = lastMessage.toLowerCase();

    // Verify if OpenAI key exists (fallback to mock if not configured)
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (apiKey) {
      // If the user has configured OpenAI, we could import and use it.
      // But to prevent server boot failures due to missing packages,
      // we provide a robust mock engine as the default playground runtime.
    }

    addLogToConsole(`Parsing sandbox code from agent.ts...`);

    // Simulated sandbox code compiler checks
    const hasConfig = code.includes("config");
    const hasPrompt = code.includes("systemPrompt");
    
    if (!hasConfig || !hasPrompt) {
      return new Response(
        JSON.stringify({ error: "Compilation error: missing config or systemPrompt in agent.ts" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Determine simulation response based on user prompts
    if (prompt.includes("balance") || prompt.includes("sol")) {
      const response = "Checking the balance of your Devnet wallet... I found 2.0 SOL. Here is the confirmation from the RPC node.";
      const stream = createMockStream(response, {
        name: "balance",
        args: { address: "9xK8...q9wP" },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    if (prompt.includes("swap") || prompt.includes("trade") || prompt.includes("buy")) {
      const response = "Initiating a token swap on Jupiter Devnet routing... Swapping 0.2 SOL to USDC. Transaction signed and broadcasted successfully.";
      const stream = createMockStream(response, {
        name: "swap",
        args: { amount: 0.2, inputToken: "SOL", outputToken: "USDC" },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    if (prompt.includes("mint") || prompt.includes("nft")) {
      const response = "Calling Metaplex Devnet program... Minting a compressed NFT 'Xeus Agent NFT' to your wallet. Creation complete.";
      const stream = createMockStream(response, {
        name: "mint",
        args: { name: "Xeus Agent NFT", symbol: "XEUS" },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    // Generic chat fallback
    const response = "I am your running Xeus agent. I can check wallet balances, swap tokens on Jupiter, and mint NFTs on Devnet. What on-chain action should I take next?";
    const stream = createMockStream(response);
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function addLogToConsole(log: string) {
  console.log(`[xeus-api] ${log}`);
}
