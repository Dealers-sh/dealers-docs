# Dealers.sh Docs

[![Docs](https://img.shields.io/badge/docs-docs.dealers.sh-1be3a3)](https://docs.dealers.sh)
![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?logo=nextdotjs)
![Nextra](https://img.shields.io/badge/Nextra-4.6-000000)
![React](https://img.shields.io/badge/React-19-149eca?logo=react)
![Abstract](https://img.shields.io/badge/Abstract-chain%202741-1be3a3)
![License](https://img.shields.io/badge/License-Proprietary-red)

Documentation site for [Dealers.sh](https://dealers.sh) — the on-chain PvE/PvP mafia strategy game on
[Abstract Chain](https://abs.xyz). Live at [docs.dealers.sh](https://docs.dealers.sh). Built with
Next.js + Nextra; every game constant on the site (fees, odds, rank ladders, contract addresses) is
rendered straight from the deployed contracts, so the docs can't drift from chain.

> **Single source of truth:** numbers on these pages come from a committed on-chain snapshot, never
> typed by hand. If a page disagrees with the deployed contract, the contract wins — re-run
> [`pnpm sync-config`](#chain-config-sync).

## Develop

Requires Node `>=20.18` and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev        # local dev server (Turbopack)
pnpm build      # production build (statically prerendered)
pnpm start      # serve the production build
pnpm lint       # next lint
```

The active network defaults to `mainnet`; override per-command with `NEXT_PUBLIC_NETWORK=testnet pnpm dev`.

## Chain config sync

The docs read contract config from committed snapshots in `generated/chain-config.<network>.json`
rather than from chain at request time. MDX pages pull values through config-driven components
(`<C path="…" />`, `<ExplorerLink />`, `<ContractAddressesTable />`, `<RankLadderTable />`, …) that
resolve against the active snapshot.

To refresh a snapshot after a contract deploy or retune:

```bash
# Reads the live RPC for the target network via viem and rewrites the snapshot
NEXT_PUBLIC_NETWORK=mainnet pnpm sync-config
```

Adding a new network is a three-step change:

1. Fill its `contracts` and `explorerUrl` in [`lib/networks.js`](lib/networks.js).
2. Run `NEXT_PUBLIC_NETWORK=<net> pnpm sync-config` to generate the snapshot.
3. Register the snapshot import in [`lib/chain-config.js`](lib/chain-config.js).

The JSON diff after a re-sync doubles as a retune changelog. A few values can't be read on-chain
(e.g. PVP infamy drop tables) and stay static in the content — see code comments before changing them.

## Networks

| Network | Chain ID | RPC | Explorer |
|---|---|---|---|
| Abstract Mainnet (default) | 2741 | `https://api.mainnet.abs.xyz` | [explorer.abs.xyz](https://explorer.abs.xyz) |
| Abstract Testnet | 11124 | `https://api.testnet.abs.xyz` | [sepolia.abscan.org](https://sepolia.abscan.org) |

## Repo layout

```
app/         Next.js app-router shell (Nextra docs theme)
content/     MDX docs — start/ · the-game/ · the-art/ · progression/ · contracts/ · agents/
components/  chain/ — config-driven tables & inline values
lib/         networks.js · chain-config.js · format.js · abi/
scripts/     sync-chain-config.mjs — on-chain reads → snapshot
generated/   chain-config.<network>.json (committed snapshots)
public/      static assets + agent skill.md
```

## Dependencies

- [Next.js](https://nextjs.org) — app-router framework (Turbopack)
- [Nextra](https://nextra.site) — MDX docs theme + search
- [viem](https://viem.sh) — typed RPC reads in the sync script
- [React 19](https://react.dev)

## License

Proprietary — all rights reserved. This code may not be copied, modified, or distributed without
explicit permission.
