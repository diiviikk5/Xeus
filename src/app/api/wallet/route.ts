import { NextRequest, NextResponse } from "next/server";
import { Connection, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";
import fs from "fs";
import path from "path";

// Helper to get or create playground wallet
// On Vercel (read-only FS), falls back to generating from PLAYGROUND_WALLET_SECRET env var
export function getPlaygroundWallet(): Keypair {
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

const DEVNET_RPC = "https://api.devnet.solana.com";

export async function GET() {
  try {
    const keypair = getPlaygroundWallet();
    const connection = new Connection(DEVNET_RPC, "confirmed");
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

export async function POST() {
  try {
    const keypair = getPlaygroundWallet();
    const connection = new Connection(DEVNET_RPC, "confirmed");

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
