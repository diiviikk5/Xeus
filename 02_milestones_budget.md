# Milestones and Budget (Revised Minimal Ask)

## Budget Ask
We are **not** requesting a large grant amount.

We are requesting standard support equivalent to:
- **200 USDG** (fixed)

## Milestone 1: Production Solana Agent Kit Integration
Deliverables:
- Integrate the official `@solana/agent-kit` npm package as the primary on-chain execution core.
- Replace custom tool wrappers with SAK's native tool bindings (token swaps, balance lookups, transfers, NFT minting).
- Support full configuration of agent capabilities, RPC endpoints, and custom prompt headers.
- Implement robust tool-calling failure handling, logging, and retry mechanics.

## Milestone 2: Shareable Deployment Pipeline
Deliverables:
- Build a lightweight hosted agent runner to execute and serve agents at `xeus.sh/agent/[id]`.
- Generate public, shareable playground links for developers to demo their running agents to reviewers, users, or hackathon judges.
- Provide simple iframe embedding code so developers can embed their running agents into their own landing pages.

## Milestone 3: Template Gallery & AI Scaffold Mode
Deliverables:
- Release a template gallery containing 5 pre-configured agent flows (DeFi swap bot, NFT minter, token launch agent, portfolio tracker, etc.) following the `solana.new` `SKILL.md` format.
- Integrate an AI-scaffolding helper that translates English descriptions (e.g., "build an agent that swaps SOL for USDC when price drops") into working TypeScript agent configuration code.
- Publish documentation and guides showing how developers can clone and extend these templates.

## Success Criteria
- Developers can write, test, and host a custom Solana AI agent entirely from the browser in under 5 minutes.
- Real Devnet transactions are executed reliably using the official `@solana/agent-kit` runtime.
- Publicly shareable playground links render a live chat panel executing the custom agent logic.
