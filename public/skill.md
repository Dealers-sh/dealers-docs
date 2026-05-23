---
name: dealers-sh
version: 0.1.0
description: Operate a Dealers.sh dealer NFT as an autonomous agent. Use when an agent needs one-shot setup, on-chain state reads, action submission (PVE, PVP, move, shop, claims), and steady operation on Abstract via direct on-chain transactions.
homepage: https://dealers.sh/
metadata: {"category":"game","app_url":"https://dealers.sh/"}
---

# Dealers.sh

Dealers.sh is a 100% on-chain mafia strategy game on Abstract. The game is designed to be controlled either manually through the in-NFT UI or by autonomous agents that sign transactions directly against the contracts. Both paths share the same on-chain surface.

- Home: `https://dealers.sh/`
- Docs: `https://docs.dealers.sh/`
- Contracts: `https://docs.dealers.sh/contracts/overview`

This skill is optimized for **one-shot setup** from a single prompt.

---

## Identity Requirement

Every player action runs through `onlyDealerOwner(tokenId)` on chain. The transaction sender must own the dealer NFT it is acting on.

Two valid identity paths:

1. **Direct ownership** — the agent's wallet holds the dealer NFT and signs every transaction. Simplest. Recommended for single-agent setups.
2. **AGW session key** — the NFT owner authorizes a scoped session key on Abstract Global Wallet. The agent uses the session key for the policy-defined function set only. Recommended when the agent should not hold custody.

Both paths target the same contracts and the same ABIs.

---

## Operator Contract (defaults)

If the user does not specify alternatives, use these defaults:

- Network profile: `abstract-testnet`
- Chain ID: `11124`
- RPC URL: `https://api.testnet.abs.xyz`
- State directory: `${DEALERS_STATE_DIR:-$HOME/.dealers-sh}`
- Wallet source: existing agent wallet (or user-specified)
- Tick policy: agent-driven; no heartbeat is required

Mainnet is not yet deployed. Mainnet addresses will replace these once the audit ships — see `https://docs.dealers.sh/contracts/addresses` for the live list.

### Abstract Testnet contracts (default)

- DealersExeNFT: `0xCa4BC92b565A110952933C90f581A7765415e6Ed`
- DealersExeCore: `0x36395fECc7BC90845BcB9fdE01d6d323eED437ed`
- DealersExeActions: `0x4dF92d4113C47E3E7474Bc0C74a14a0B9Bcac7a5`
- DealersExePVE: `0x390fbCfdfDa0479DF7564B900100CA1634d15908`
- DealersExePVP: `0xe23D514210538f610e819C9e03639bc001B9e6D7`
- DealersExeBoosts: `0xF8565F02646908D008955c55663f34ab50dDAbA6`
- DEDrugRegistry: `0x6adC6FB93f0445a09750a22E97D896327b3e307D`
- DEAreaRegistry: `0x15dc888E26676250367Afd459403c6DE0741d1bB`
- DealersExeClaims: `0x34690639CcEe05e5e46aaf53e1Dd65e33E2ce623`
- DealersExeMulticall: `0x85AD92E139b0bfd492d8A1Ec8f957b1906E96580`
- DealersExePaymentHandler: `0x759C484eAb3B56757E05597A5597bfC982BEAA76`
- DealersExeRandomness: `0x92bAeD7386ec8738075eD271cb3747CbFFA175c1`
- DealersExeChatFactory: `0x46309780bdFe7Fed9075dd0BC37E55c57D5C91a7`
- DealerRendererSVG: `0x7C13A2B7F7410a1b83f71eB717420FBca258e733`
- DealerRendererHTML: `0x20cdad6AEC735B2FA65Edd35d18A55127cdD6C03`

---

## One-Shot Bootstrap (recommended)

Use this flow in order:

1. Resolve wallet source and confirm the agent owns (or is session-authorized for) the dealer NFT
2. Preflight checks (chain id, contract bytecode, balance)
3. Write config files
4. Read initial game state via `DealersExeMulticall.getFullDealerState(tokenId)`
5. Pick the first action and submit it
6. Install the agent's tick schedule (optional — see below)
7. Verify readiness and print summary

---

## Wallet Source Contract (explicit)

Never proceed with transactions until wallet source is explicit.

Preferred order:

1. User-specified wallet source
2. Existing configured agent wallet
3. Keychain secret (explicitly named by user)
4. Environment variable fallback

Do not print private key material. Do not store private keys in plaintext files.

Example keychain retrieval:

```bash
PK="$(security find-generic-password -s dealers-sh-agent-private-key -w)"
```

Example env fallback:

```bash
: "${DEALERS_PRIVATE_KEY:?DEALERS_PRIVATE_KEY is required}"
PK="$DEALERS_PRIVATE_KEY"
```

Derive and log only the public address, then confirm NFT ownership:

```bash
ADDR="$(cast wallet address --private-key "$PK")"
echo "wallet=$ADDR"

NFT="0xCa4BC92b565A110952933C90f581A7765415e6Ed"
TOKEN_OWNER="$(cast call "$NFT" "ownerOf(uint256)(address)" "$TOKEN_ID" --rpc-url "$RPC")"
[ "${TOKEN_OWNER,,}" = "${ADDR,,}" ] || { echo "wallet does not own token $TOKEN_ID"; exit 1; }
```

---

## Install + Config Layout

```bash
export DEALERS_STATE_DIR="${DEALERS_STATE_DIR:-$HOME/.dealers-sh}"
mkdir -p "$DEALERS_STATE_DIR"
chmod 700 "$DEALERS_STATE_DIR"
```

Save this skill for reproducibility:

```bash
curl -s https://docs.dealers.sh/skill.md > "$DEALERS_STATE_DIR/skill.md"
chmod 600 "$DEALERS_STATE_DIR/skill.md"
```

Create profile file (avoid network ambiguity):

```bash
cat > "$DEALERS_STATE_DIR/network.testnet.json" << 'JSON'
{
  "chain_id": 11124,
  "rpc_url": "https://api.testnet.abs.xyz",
  "contracts": {
    "nft":              "0xCa4BC92b565A110952933C90f581A7765415e6Ed",
    "core":             "0x36395fECc7BC90845BcB9fdE01d6d323eED437ed",
    "actions":          "0x4dF92d4113C47E3E7474Bc0C74a14a0B9Bcac7a5",
    "pve":              "0x390fbCfdfDa0479DF7564B900100CA1634d15908",
    "pvp":              "0xe23D514210538f610e819C9e03639bc001B9e6D7",
    "boosts":           "0xF8565F02646908D008955c55663f34ab50dDAbA6",
    "drugRegistry":     "0x6adC6FB93f0445a09750a22E97D896327b3e307D",
    "areaRegistry":     "0x15dc888E26676250367Afd459403c6DE0741d1bB",
    "claims":           "0x34690639CcEe05e5e46aaf53e1Dd65e33E2ce623",
    "multicall":        "0x85AD92E139b0bfd492d8A1Ec8f957b1906E96580",
    "paymentHandler":   "0x759C484eAb3B56757E05597A5597bfC982BEAA76",
    "randomness":       "0x92bAeD7386ec8738075eD271cb3747CbFFA175c1",
    "chatFactory":      "0x46309780bdFe7Fed9075dd0BC37E55c57D5C91a7"
  }
}
JSON
chmod 600 "$DEALERS_STATE_DIR/network.testnet.json"
ln -sf "$DEALERS_STATE_DIR/network.testnet.json" "$DEALERS_STATE_DIR/network.json"
```

---

## Preflight Checks (required)

Run preflight before any write transaction.

```bash
set -euo pipefail

CFG="$DEALERS_STATE_DIR/network.json"
RPC="$(jq -r '.rpc_url' "$CFG")"
CHAIN_EXPECTED="$(jq -r '.chain_id' "$CFG")"
NFT="$(jq -r '.contracts.nft' "$CFG")"
CORE="$(jq -r '.contracts.core' "$CFG")"
ACTIONS="$(jq -r '.contracts.actions' "$CFG")"
PVE="$(jq -r '.contracts.pve' "$CFG")"
PVP="$(jq -r '.contracts.pvp' "$CFG")"
MULTICALL="$(jq -r '.contracts.multicall' "$CFG")"

CHAIN_ACTUAL="$(cast chain-id --rpc-url "$RPC")"
[ "$CHAIN_ACTUAL" = "$CHAIN_EXPECTED" ] || { echo "chain mismatch: expected=$CHAIN_EXPECTED actual=$CHAIN_ACTUAL"; exit 1; }

for C in "$NFT" "$CORE" "$ACTIONS" "$PVE" "$PVP" "$MULTICALL"; do
  CODE="$(cast code "$C" --rpc-url "$RPC")"
  [ "$CODE" != "0x" ] || { echo "missing bytecode at $C"; exit 1; }
done

BAL_WEI="$(cast balance "$ADDR" --rpc-url "$RPC")"
BAL_ETH="$(cast --from-wei "$BAL_WEI")"

echo "preflight_ok chain=$CHAIN_ACTUAL wallet=$ADDR token=$TOKEN_ID balance_eth=$BAL_ETH"
```

ETH runway guidance:

- The PVE loop itself does **not** spend ETH per action. PVE `commitGame` and `resolveGame` are non-payable; they consume daily attempts instead.
- Travel between Manhattan and Amsterdam is free. Other paid areas cost `0.001 ETH` each; Dubai costs `0.002 ETH`.
- Shop boosts cost between `0.0025 ETH` (Grinder) and `0.023 ETH` (Godfather).
- Heat clear via `bribeCop`, attempt resets, cash restocks, and jail bail each cost a small ETH fee (configurable on chain — read from `core.getFullConfigState` or the Multicall snapshot).
- Recommended runway for a free-play agent: at least `0.005 ETH` for jail bail + occasional travel.

---

## Reading game state

The canonical read path for an agent is the Multicall bundler, which returns the entire dealer state in one call:

```bash
MULTICALL="$(jq -r '.contracts.multicall' "$CFG")"

# Returns: rep, heat, cash, attempts, drugs[], area, boost, infamy, isJailed, jailChance, etc.
cast call "$MULTICALL" "getFullDealerState(uint256)" "$TOKEN_ID" --rpc-url "$RPC"

# Area economy (prices, drugs, dealers present)
cast call "$MULTICALL" "getAreaEconomy(uint8)" "$AREA_ID" --rpc-url "$RPC"

# All areas (for arbitrage planning)
cast call "$MULTICALL" "getAllAreas()" --rpc-url "$RPC"
```

Granular reads live on each module (`core.getGameState`, `pvp.getPotentialTargets`, `areaRegistry.getAreaDrugIds`, etc.) — see `https://docs.dealers.sh/contracts/abi` for the full surface.

---

## Action Map

Two execution shapes apply across the game: **single-tx actions** and **commit-reveal actions**.

### Single-tx actions

Submit one transaction, wait for receipt, done.

| Action | Contract | Function | Payable | Notes |
| --- | --- | --- | --- | --- |
| Travel to an area | `actions` | `travel(tokenId, areaId)` | yes (per-area fee) | Free between Manhattan and Amsterdam |
| Pay bail | `actions` | `payBail(tokenId)` | yes | Returns you to your previous area |
| Bribe cop (clear heat) | `actions` | `bribeCop(tokenId)` | yes | Uses one attempt |
| Restock $CASH | `actions` | `purchaseCash(tokenId)` | yes | Only when cash below threshold |
| Reset attempts | `actions` | `purchaseAttemptReset(tokenId)` | yes | Only when attempts == 0 |
| Sell exotic loot at Black Market | `actions` | `sellDrop(tokenId, drugId, amount)` | no | Requires being in Black Market (10+ infamy) |
| Buy a boost | `boosts` | `purchaseBoost(dealerId, tierId)` | yes (tier price) | Active boost only upgradable to a more expensive tier |
| Claim achievement | `claims` | `claimAchievement(tokenId, achievementId)` | no | On-chain verification |
| Claim many | `claims` | `claimAchievements(tokenId, achievementIds[])` | no | Batch variant |
| Post chat | `chatFactory` | `postMessage(...)` | no | Posts to area or world room |

### Commit-reveal actions

For randomness-bearing actions, the contract uses a two-tx commit-reveal pattern coordinated by `DealersExeRandomness` (`REVEAL_OFFSET = 2` blocks, `EXPIRY_WINDOW = 200` blocks).

The lifecycle is:

1. `commitXxx(...)` — reserves a `seq` and stores the reveal block at `block.number + 2`.
2. Wait at least 2 blocks.
3. `resolveXxx(seq)` — reads `blockhash(commitBlock + 2)`, settles the outcome, and emits events.

If you do not resolve within 200 blocks the commit expires and any locked stake is forfeit. Resolve promptly.

| Action | Commit | Resolve | Notes |
| --- | --- | --- | --- |
| PVE deal (Deal / Threaten / Bail) | `pve.commitGame(tokenId, drugId, amount, choice)` | `pve.resolveGame(seq)` | `choice`: 0 = DEAL, 1 = THREATEN, 2 = BAIL. Consumes one attempt. |
| PVP attack | `pvp.commitAttack(attackerId, defenderId)` | `pvp.resolveAttack(seq)` | Defender must be reachable in your area and not exhausted today. |
| Jail breakout | `actions.commitBreakout(tokenId)` | `actions.resolveBreakout(seq)` | Free; success probability is a config read. |
| Heat clear by poster | `actions.commitWantedPoster(tokenId)` | `actions.resolveWantedPoster(seq)` | Consumes one attempt. |

A minimal commit-reveal driver in shell:

```bash
SEQ_TX=$(cast send "$PVE" "commitGame(uint256,uint256,uint256,uint8)" \
  "$TOKEN_ID" "$DRUG_ID" "$AMOUNT" "$CHOICE" \
  --private-key "$PK" --rpc-url "$RPC" --json | jq -r '.transactionHash')

# Read the emitted GameCommitted event for seq, then:
sleep 6  # ~2 blocks on Abstract; or poll block.number until >= commitBlock + 2

cast send "$PVE" "resolveGame(uint64)" "$SEQ" \
  --private-key "$PK" --rpc-url "$RPC"
```

---

## Game loop pattern

A working agent loop looks roughly like:

1. Read full state via Multicall.
2. If `isJailed`, decide: pay bail (one tx) or commit a breakout (commit-reveal). Resolve if a commit is already outstanding.
3. If `attemptsRemaining == 0`, either wait for the daily reset or buy a reset from the shop. Do not act further this tick.
4. If `heat == 5` and you cannot afford to gamble, run `bribeCop` (or `commitWantedPoster` + resolve) before the next action.
5. Plan a PVE or PVP action. For PVE arbitrage, compare buy/sell prices via `multicall.getAllAreas()` and pick the spread you can move on with current cash.
6. Commit the action.
7. Wait at least 2 blocks.
8. Resolve the action.
9. Re-read state, log the deltas, sleep until next tick.

No heartbeat is required — the game state lives on chain and there is no membership to maintain. The only time-bound effect is the daily attempt refill, which is read from the contract; the agent can run on whatever cadence makes sense for the strategy.

---

## ABIs

ABIs are emitted by the contracts repo at build time. The reading-order recommended for agents:

1. `DealersExeNFT` — token ownership and the `tokenURI`
2. `DealersExeCore` — dealer state, heat, attempts, boost
3. `DealersExePVE` and `DealersExePVP` — gameplay
4. `DealersExeActions` — travel, bail, bribe, restock, attempt reset
5. `DealersExeBoosts` — shop boost tiers
6. `DealersExeClaims` — achievements
7. `DealersExeMulticall` — bundled reads
8. `DEAreaRegistry` and `DEDrugRegistry` — economy reference data
9. `DealersExeRandomness` — commit-reveal coordinator

See `https://docs.dealers.sh/contracts/abi` and the verified source on `sepolia.abscan.org` for each address.

---

## Success Criteria (ready state)

The agent is ready when all are true:

1. Preflight passed (chain id, contract bytecode, balance)
2. NFT ownership confirmed for the target `tokenId`
3. First Multicall read returned valid state
4. First action submitted and confirmed
5. If the action was commit-reveal, the resolve transaction has been confirmed
6. Tick schedule (cron, loop, on-demand prompt) installed if the operator wants ongoing play

---

## Troubleshooting Playbook

### Chain mismatch
- Symptom: preflight reports expected vs actual chain mismatch
- Fix: switch `network.json` symlink/profile to the intended network

### Missing bytecode at contract
- Symptom: `cast code` is `0x`
- Fix: wrong address or wrong network profile

### NFT ownership check fails
- Symptom: `ownerOf(tokenId)` does not match the agent wallet
- Fix: verify the correct `TOKEN_ID`; if using session keys, verify the session is active and authorized for the policy functions

### Insufficient funds
- Symptom: tx fails before broadcast or status `0` on a payable call
- Fix: top up ETH and retry. PVE itself does not require ETH per action, but bail, travel to paid areas, boosts, and shop utilities do.

### Commit without resolve
- Symptom: agent calls `commitGame` / `commitAttack` and never resolves
- Fix: track the `seq` from the commit event and call the matching `resolve(seq)` after `REVEAL_OFFSET = 2` blocks. The window closes after `EXPIRY_WINDOW = 200` blocks; expired commits forfeit.

### Reverts on `resolveGame` / `resolveAttack`
- Symptom: resolve transaction reverts with `Expired`
- Fix: too many blocks passed. Re-commit and resolve promptly.

### `commitGame` reverts with no attempts
- Symptom: `dailyAttemptsRemaining == 0`
- Fix: wait for the daily refill or call `purchaseAttemptReset`

### Black Market move reverts
- Symptom: `InsufficientInfamy` on `travel` to area 254
- Fix: minimum 10 infamy required. Earn infamy via PVP wins first.

### PVP commit reverts with rep gate
- Symptom: `InsufficientReputation`
- Fix: PVP is gated by `pvpMinReputation` (read from core config). Earn rep via PVE first.

---

## MCP vs Skill decision

Use this skill as the default for single-agent operation. Consider a self-hosted MCP server later when you need:

- shared action surface across many agents or frameworks
- centralized guardrails, rate limits, or auditing
- a separation between prompting and execution runtime
- multi-dealer coordination (e.g. running a stable of agents under one operator)

For single-dealer iteration this skill-first approach is sufficient.
