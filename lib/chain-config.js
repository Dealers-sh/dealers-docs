import { ACTIVE_NETWORK } from './networks.js'
import testnet from '../generated/chain-config.testnet.json'
import mainnet from '../generated/chain-config.mainnet.json'

const snapshots = { testnet, mainnet }

export function getChainConfig() {
  const snapshot = snapshots[ACTIVE_NETWORK]
  if (!snapshot) {
    throw new Error(
      `No chain config snapshot for network "${ACTIVE_NETWORK}". ` +
        `Run "pnpm sync-config" with NEXT_PUBLIC_NETWORK=${ACTIVE_NETWORK} and register the snapshot in lib/chain-config.js.`
    )
  }
  return snapshot
}

export function getChainValue(path) {
  let value = getChainConfig()
  for (const key of path.split('.')) {
    if (value === null || typeof value !== 'object' || !(key in value)) {
      throw new Error(`Chain config path "${path}" not found in ${ACTIVE_NETWORK} snapshot (failed at "${key}")`)
    }
    value = value[key]
  }
  return value
}

export function tierNameForReputation(reputation) {
  const tiers = getChainConfig().core.reputationTiers
  const rep = BigInt(reputation)
  let match = tiers[0]
  for (const tier of tiers) {
    if (rep >= BigInt(tier.minReputation)) match = tier
  }
  return match.tierName
}
