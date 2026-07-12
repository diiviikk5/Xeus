import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DEPLOY_DIR = path.join(process.cwd(), "public", "deployed-agents");

// Ensure directory exists
if (!fs.existsSync(DEPLOY_DIR)) {
  fs.mkdirSync(DEPLOY_DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    const { code, name, config } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code content is required" }, { status: 400 });
    }

    // Generate a unique ID
    const randomId = Math.random().toString(36).substring(2, 8);
    const agentId = `${name?.toLowerCase().replace(/[^a-z0-9]/g, "-") || "agent"}-${randomId}`;

    const filePath = path.join(DEPLOY_DIR, `${agentId}.json`);
    const agentData = {
      id: agentId,
      name: name || "Anonymous Agent",
      code,
      config: config || {},
      deployedAt: new Date().toISOString(),
    };

    fs.writeFileSync(filePath, JSON.stringify(agentData, null, 2));

    return NextResponse.json({
      success: true,
      agentId,
      url: `/agent/${agentId}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
