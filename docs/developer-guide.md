# Xeus Developer Guide: Building & Extending Solana AI Agents

Xeus is a browser-native IDE designed to let you prototype, test, and deploy Solana AI agents in under 5 minutes. This guide covers the workspace architecture, adding custom tools, using AI Scaffolding, and embedding your running agents into external pages.

---

## 🏗️ 1. Core Architecture
Xeus combines a custom browser-based Monaco editor with a live serverless agent runner:
* **The Editor**: Autocomplete-equipped IDE for writing TypeScript agent configuration (`agent.ts`) and configuring dependencies.
* **The Sandbox**: A Vercel AI SDK chat interface executing real transactions on Solana Devnet.
* **On-Chain Keypairs**: Each session automatically generates an ephemeral developer wallet funded on-demand via a Devnet Faucet.

---

## 🗂️ 2. Starting with Templates
Xeus comes pre-loaded with four templates under the **Templates** section in the File Explorer sidebar:
1. **Solana Scout (Default)**: Best for standard balance lookups, simple token swaps, and mints.
2. **Arbitrage Sniper**: Instructs the agent to scan Jupiter pricing and simulate token arbitrage routes.
3. **NFT Creator**: Focuses on minting compressed NFTs (cNFTs) and verifying collection groups on-chain.
4. **DAO Voter**: Integrates governance tracking and auto-voting logic.

---

## 🛠️ 3. Adding Custom Tools & APIs
Xeus's runtime executes tools using the Vercel AI SDK. To add your own custom Solana program or external API wrapper, modify the tools registry in [src/app/api/chat/route.ts](file:///D:/Xeus/src/app/api/chat/route.ts):

### Step 1: Define Your Zod Schema
Create a schema validating the inputs the LLM will provide:
```typescript
const myCustomActionSchema = z.object({
  recipient: z.string().describe("The base58 address of the recipient."),
  amountSOL: z.number().describe("The amount of SOL to lock in the escrow."),
});
```

### Step 2: Register the Tool
Add the tool declaration in the tools object inside `route.ts`:
```typescript
const myEscrowTool = tool({
  description: "Initialize a secure escrow account and transfer SOL.",
  parameters: myCustomActionSchema,
  execute: async ({ recipient, amountSOL }: { recipient: string; amountSOL: number }) => {
    try {
      // Add your web3.js transaction instructions here:
      // const transaction = new Transaction().add(...);
      // const signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);
      return { status: "success", signature, recipient, amountSOL };
    } catch (err: any) {
      return { status: "error", error: err.message };
    }
  }
} as any);
```

### Step 3: Pass to the AI Model
Register the tool in the `tools` object inside `streamText`:
```typescript
const result = streamText({
  model: openai("gpt-4o"),
  system: systemPrompt,
  messages,
  tools: {
    getBalance: getBalanceTool,
    myCustomAction: myEscrowTool, // Added here!
  },
});
```

---

## 🧠 4. AI Scaffold Mode
Instead of manually typing the TypeScript agent configuration, click **AI Scaffold** on the toolbar. 
1. Enter your requirements in plain English (e.g. *"I want a sniper bot that buys USDC with half my SOL whenever my SOL balance is above 3.5"*).
2. The scaffolding endpoint (`/api/scaffold`) prompts GPT-4o to construct a valid Xeus `agent.ts` configuration.
3. The generated code is loaded into your Monaco Editor workspace automatically.

---

## 🚀 5. Deploying & Iframe Embedding
When you click **Deploy**:
1. Your agent is packaged and saved under `/api/deploy`.
2. A public, shareable link is generated at `/agent/[id]`.
3. Visitors can access this page to interact with your live agent on Devnet.
4. Click **Share & Embed** in the header to grab the iframe embed snippet:
   ```html
   <iframe 
     src="http://localhost:3000/agent/your-agent-id" 
     style="width: 100%; height: 600px; border: 1px solid rgba(255, 55, 0, 0.12); border-radius: 12px; background: black;" 
     allow="clipboard-write">
   </iframe>
   ```
5. Drop this code into your own landing page or blog to showcase your agent in action!
