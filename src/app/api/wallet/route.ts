import { NextRequest, NextResponse } from "next/server";
import { Connection, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";
import fs from "fs";
import path from "path";
import bs58 from "bs58";

// Helper to get or create playground wallet
// If custom base58 private key is passed, decode and use that.
export function getPlaygroundWallet(customPrivateKey?: string): Keypair {
  if (customPrivateKey) {
    try {
      const decoded = bs58.decode(customPrivateKey.trim());
      return Keypair.fromSecretKey(decoded);
    } catch (e: any) {
      throw new Error(`Invalid custom Solana private key: ${e.message}`);
    }
  }

  // 1. Try env var first (works on Vercel)
  if (process.env.PLAYGROUND_WALLET_SECRET) {
    try {
      const secretKey = JSON.parse(process.env.PLAYGROUND_WALLET_SECRET);
      return Keypair.fromSecretKey(new Uint8Array(secretKey));
    } catch (e) {
      console.error("Failed to load wallet from env var", e);
    }
  }

  // 2. Try local file (works in local dev)
  try {
    const walletPath = path.join(process.cwd(), "playground-wallet.json");
    if (fs.existsSync(walletPath)) {
      const secretKey = JSON.parse(fs.readFileSync(walletPath, "utf8"));
      return Keypair.fromSecretKey(new Uint8Array(secretKey));
    }
    // Generate and persist locally
    const keypair = Keypair.generate();
    fs.writeFileSync(walletPath, JSON.stringify(Array.from(keypair.secretKey)), "utf8");
    return keypair;
  } catch (e) {
    // Vercel / read-only FS — generate an ephemeral keypair for demo
    console.warn("Read-only FS detected, using ephemeral playground keypair");
    return Keypair.generate();
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customKey = searchParams.get("privateKey") || undefined;
    const customRpc = searchParams.get("rpcUrl") || "https://api.devnet.solana.com";

    const keypair = getPlaygroundWallet(customKey);
    const connection = new Connection(customRpc, "confirmed");
    const balance = await connection.getBalance(keypair.publicKey);

    return NextResponse.json({
      publicKey: keypair.publicKey.toBase58(),
      balance: balance / LAMPORTS_PER_SOL,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let customKey: string | undefined;
    let customRpc = "https://api.devnet.solana.com";

    try {
      const body = await req.json();
      customKey = body.privateKey || undefined;
      customRpc = body.rpcUrl || "https://api.devnet.solana.com";
    } catch (e) {}

    const keypair = getPlaygroundWallet(customKey);
    const connection = new Connection(customRpc, "confirmed");

    const signature = await connection.requestAirdrop(
      keypair.publicKey,
      1 * LAMPORTS_PER_SOL
    );

    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction(
      { signature, ...latestBlockhash },
      "confirmed"
    );

    const balance = await connection.getBalance(keypair.publicKey);

    return NextResponse.json({
      publicKey: keypair.publicKey.toBase58(),
      balance: balance / LAMPORTS_PER_SOL,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
