import { create } from "zustand";

export interface PlaygroundFile {
  name: string;
  content: string;
  language: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  toolCalls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
    status?: "pending" | "success" | "error";
    txHash?: string;
    result?: string;
  }>;
}

export interface PlaygroundWallet {
  publicKey: string;
  balance: number;
  loading: boolean;
}

interface PlaygroundState {
  files: Record<string, PlaygroundFile>;
  activeFileName: string;
  isRunning: boolean;
  wallet: PlaygroundWallet;
  messages: ChatMessage[];
  consoleLogs: string[];
  
  // Actions
  setFileContent: (fileName: string, content: string) => void;
  setActiveFile: (fileName: string) => void;
  setIsRunning: (isRunning: boolean) => void;
  setWallet: (wallet: Partial<PlaygroundWallet>) => void;
  setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  addConsoleLog: (log: string) => void;
  clearConsoleLogs: () => void;
  resetPlayground: () => void;
}

export const AGENT_TEMPLATES = {
  scout: {
    id: "scout",
    name: "Solana Scout",
    description: "Balances, trades, and NFTs.",
    code: `// agent.ts — Xeus Solana Agent Config
import { SolanaAgentKit, createSolanaTools } from "@solana/agent-kit";

export const config = {
  name: "Solana Scout",
  model: "gpt-4o",
  version: "1.0.0",
  
  // Enabled plugins for this agent
  plugins: ["token", "defi", "nft"],
  
  systemPrompt: \`You are a helpful Solana scout agent.
You execute trades, check balances, and mint NFTs on Devnet.
Always summarize transactions clearly to the user.\`,
  
  // Safety limits for Devnet execution
  constraints: {
    maxTxSOL: 0.5,
    maxTxPerHour: 5,
    allowedActions: ["balance", "trade", "transfer", "mint"]
  }
};
`
  },
  arbitrage: {
    id: "arbitrage",
    name: "Arbitrage Sniper",
    description: "Scan pools & execute swaps.",
    code: `// agent.ts — Arbitrage Sniper Config
import { SolanaAgentKit } from "@solana/agent-kit";

export const config = {
  name: "Arbitrage Sniper",
  model: "gpt-4o",
  version: "2.1.0",
  plugins: ["defi", "jupiter"],
  systemPrompt: \`You are an automated Arbitrage Sniper agent.
You scan Jupiter liquidity pools for price discrepancies and execute atomic swap routes.
Always report the price difference, execution path, and net profit in USDC/SOL.\`,
  constraints: {
    maxTxSOL: 2.0,
    minProfitUSDC: 0.1,
    maxTxPerHour: 20,
    allowedActions: ["trade", "swap"]
  }
};
`
  },
  nftCreator: {
    id: "nftCreator",
    name: "NFT Creator",
    description: "Mint cNFTs and collections.",
    code: `// agent.ts — NFT Creator Config
import { SolanaAgentKit } from "@solana/agent-kit";

export const config = {
  name: "NFT Creator",
  model: "gpt-4o",
  version: "1.2.0",
  plugins: ["nft", "bubblegum"],
  systemPrompt: \`You are an on-chain NFT Creator agent.
You mint compressed NFTs (cNFTs) on Solana using Bubblegum program trees.
You register collections and configure metadata.
Always provide the Explorer links and collection details to the user.\`,
  constraints: {
    maxTxSOL: 0.1,
    maxTxPerHour: 2,
    allowedActions: ["mint"]
  }
};
`
  },
  daoMonitor: {
    id: "daoMonitor",
    name: "DAO Voter",
    description: "Govern & vote on-chain.",
    code: `// agent.ts — DAO governance voter config
import { SolanaAgentKit } from "@solana/agent-kit";

export const config = {
  name: "DAO Voter",
  model: "gpt-4o-mini",
  version: "1.0.0",
  plugins: ["governance"],
  systemPrompt: \`You are a DAO Governance Monitor agent.
You track proposals, extract details, and vote automatically based on the user's criteria.
Always summarize active proposals and why you voted a certain way.\`,
  constraints: {
    maxTxSOL: 0.05,
    maxTxPerHour: 1,
    allowedActions: ["balance", "vote"]
  }
};
`
  }
};

const DEFAULT_FILES: Record<string, PlaygroundFile> = {
  "agent.ts": {
    name: "agent.ts",
    content: AGENT_TEMPLATES.scout.code,
    language: "typescript",
  },
  "package.json": {
    name: "package.json",
    content: `{
  "name": "xeus-agent",
  "dependencies": {
    "@solana/agent-kit": "^1.0.0",
    "dotenv": "^16.0.0"
  }
}`,
    language: "json",
  },
};

interface PlaygroundState {
  files: Record<string, PlaygroundFile>;
  activeFileName: string;
  isRunning: boolean;
  wallet: PlaygroundWallet;
  messages: ChatMessage[];
  consoleLogs: string[];
  
  // Actions
  setFileContent: (fileName: string, content: string) => void;
  setActiveFile: (fileName: string) => void;
  setIsRunning: (isRunning: boolean) => void;
  setWallet: (wallet: Partial<PlaygroundWallet>) => void;
  setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  addConsoleLog: (log: string) => void;
  clearConsoleLogs: () => void;
  resetPlayground: () => void;
  loadTemplate: (key: keyof typeof AGENT_TEMPLATES) => void;
}

export const usePlayground = create<PlaygroundState>((set) => ({
  files: DEFAULT_FILES,
  activeFileName: "agent.ts",
  isRunning: false,
  wallet: {
    publicKey: "Loading...",
    balance: 0,
    loading: true,
  },
  messages: [
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! Click the **▶ Run** button at the bottom to launch your agent code on Solana Devnet. Once running, you can prompt me to check wallet balances, swap tokens, or execute transfers in real time.",
    },
  ],
  consoleLogs: [
    "[xeus] IDE Workspace loaded.",
    "[xeus] Ready to connect to Solana Devnet.",
  ],

  setFileContent: (fileName, content) =>
    set((state) => ({
      files: {
        ...state.files,
        [fileName]: {
          ...state.files[fileName],
          content,
        },
      },
    })),

  setActiveFile: (fileName) => set({ activeFileName: fileName }),
  
  setIsRunning: (isRunning) => set({ isRunning }),
  
  setWallet: (walletUpdate) =>
    set((state) => ({
      wallet: {
        ...state.wallet,
        ...walletUpdate,
      },
    })),

  setMessages: (messagesUpdate) =>
    set((state) => ({
      messages: typeof messagesUpdate === "function" ? messagesUpdate(state.messages) : messagesUpdate,
    })),

  addConsoleLog: (log) =>
    set((state) => ({
      consoleLogs: [...state.consoleLogs, `[${new Date().toLocaleTimeString()}] ${log}`],
    })),

  clearConsoleLogs: () => set({ consoleLogs: [] }),

  resetPlayground: () =>
    set({
      files: DEFAULT_FILES,
      activeFileName: "agent.ts",
      isRunning: false,
      messages: [
        {
          id: "welcome",
          role: "assistant",
          content: "Hello! Click the **▶ Run** button at the bottom to launch your agent code on Solana Devnet. Once running, you can prompt me to check wallet balances, swap tokens, or execute transfers in real time.",
        },
      ],
      consoleLogs: [
        "[xeus] IDE Workspace re-initialized.",
        "[xeus] Ready to connect to Solana Devnet.",
      ],
    }),

  loadTemplate: (key) =>
    set((state) => ({
      files: {
        ...state.files,
        "agent.ts": {
          ...state.files["agent.ts"],
          content: AGENT_TEMPLATES[key].code,
        },
      },
      consoleLogs: [
        ...state.consoleLogs,
        `[${new Date().toLocaleTimeString()}] [xeus] Loaded agent template: "${AGENT_TEMPLATES[key].name}"`
      ]
    })),
}));
