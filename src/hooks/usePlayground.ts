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

const DEFAULT_AGENT_CODE = `// agent.ts — Xeus Solana Agent Config
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
`;

const DEFAULT_FILES: Record<string, PlaygroundFile> = {
  "agent.ts": {
    name: "agent.ts",
    content: DEFAULT_AGENT_CODE,
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
}));
