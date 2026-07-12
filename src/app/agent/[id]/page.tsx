import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import DeployedAgentClient from "./DeployedAgentClient";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DeployedAgentPage({ params }: PageProps) {
  const { id } = await params;
  const filePath = path.join(process.cwd(), "public", "deployed-agents", `${id}.json`);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const fileData = fs.readFileSync(filePath, "utf8");
  const agent = JSON.parse(fileData);

  return <DeployedAgentClient agent={agent} />;
}
