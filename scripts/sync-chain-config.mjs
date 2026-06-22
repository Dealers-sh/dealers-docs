import { createPublicClient, http } from 'viem'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getNetwork, ACTIVE_NETWORK } from '../lib/networks.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ABIS = JSON.parse(readFileSync(join(ROOT, 'lib/abi/dealers-min.json'), 'utf8'))

const HEIST_STAGES = 5
const HEIST_DIFFICULTIES = 3
const RARITY_NAMES = ['Common', 'Uncommon', 'Rare']
const MINT_STATUS_NAMES = ['Disabled', 'Family', 'Whitelist', 'Public']

const networkKey = process.env.NEXT_PUBLIC_NETWORK || ACTIVE_NETWORK
const network = getNetwork(networkKey)
if (!network.contracts) {
  throw new Error(`Network "${networkKey}" has no contract addresses configured in lib/networks.js`)
}

const client = createPublicClient({
  chain: { id: network.chainId, name: network.name, nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: [network.rpcUrl] } } },
  transport: http(network.rpcUrl),
})

function read(contract, functionName, args = []) {
  return client.readContract({
    address: network.contracts[contract === 'DealersAreaRegistry' ? 'DEAreaRegistry' : contract === 'DealersDrugRegistry' ? 'DEDrugRegistry' : contract],
    abi: ABIS[contract],
    functionName,
    args,
  })
}

async function fetchCore() {
  const [config, maxReputation, maxInfamy, baseMaxAttempts, maxHeatLevel, maxTiers, startingReputation, starterWeed, starterXtc, starterCocaine, decayGracePeriod, decayRatePerDay, infamyDecayMultiplier, stashDivisor] = await Promise.all([
    read('DealersCore', 'config'),
    read('DealersCore', 'MAX_REPUTATION'),
    read('DealersCore', 'MAX_INFAMY'),
    read('DealersCore', 'BASE_MAX_ATTEMPTS'),
    read('DealersCore', 'MAX_HEAT_LEVEL'),
    read('DealersCore', 'MAX_TIERS'),
    read('DealersCore', 'STARTING_REPUTATION'),
    read('DealersCore', 'STARTER_WEED'),
    read('DealersCore', 'STARTER_XTC'),
    read('DealersCore', 'STARTER_COCAINE'),
    read('DealersCore', 'DECAY_GRACE_PERIOD'),
    read('DealersCore', 'DECAY_RATE_PER_DAY'),
    read('DealersCore', 'INFAMY_DECAY_MULTIPLIER'),
    read('DealersCore', 'STASH_DIVISOR'),
  ])

  const reputationTiers = []
  for (let i = 0; i < Number(maxTiers); i++) {
    try {
      const [minReputation, winBonus, tieBonus, lossPenalty, repCap, tierName] = await read('DealersCore', 'reputationTiers', [BigInt(i)])
      reputationTiers.push({ tier: i, minReputation, winBonus, tieBonus, lossPenalty, repCap, tierName })
    } catch {
      break
    }
  }
  if (reputationTiers.length === 0) throw new Error('No reputation tiers configured on-chain')

  return {
    config,
    maxReputation,
    maxInfamy,
    baseMaxAttempts,
    maxHeatLevel,
    startingReputation,
    starterDrugs: { weed: starterWeed, xtc: starterXtc, cocaine: starterCocaine },
    decay: { gracePeriodSeconds: decayGracePeriod, ratePerDay: decayRatePerDay, infamyMultiplier: infamyDecayMultiplier },
    stashDivisor,
    reputationTiers,
  }
}

async function fetchPve() {
  const [tieChance, winChance, repStakeDivisor] = await Promise.all([
    read('DealersPVE', 'tieChance'),
    read('DealersPVE', 'winChance'),
    read('DealersPVE', 'repStakeDivisor'),
  ])
  return { tieChance, winChance, repStakeDivisor }
}

async function fetchHeists() {
  const stageIndices = [...Array(HEIST_STAGES).keys()]
  const perStage = (fn) => Promise.all(stageIndices.map((i) => read('DealersHeists', fn, [BigInt(i)])))

  const [winOdds, setbackOdds, setbackKeepBps, potMinBps, potMaxBps, repReward, jackpot, supplyMixRows, ethAddOn, jackpotReserveBps, minCashStage, bustRepPenalty, idleTimeoutSeconds, difficulties] = await Promise.all([
    perStage('stageWinOdds'),
    perStage('stageSetbackOdds'),
    perStage('stageSetbackKeepBps'),
    perStage('stagePotMinBps'),
    perStage('stagePotMaxBps'),
    perStage('stageRepReward'),
    perStage('jackpotConfig'),
    Promise.all(stageIndices.map((i) => Promise.all([0, 1, 2].map((j) => read('DealersHeists', 'supplyMix', [BigInt(i), BigInt(j)]))))),
    read('DealersHeists', 'ethAddOn'),
    read('DealersHeists', 'jackpotReserveBps'),
    read('DealersHeists', 'minCashStage'),
    read('DealersHeists', 'bustRepPenalty'),
    read('DealersHeists', 'IDLE_TIMEOUT'),
    Promise.all([...Array(HEIST_DIFFICULTIES).keys()].map((d) => read('DealersHeists', 'difficultyConfigs', [d]))),
  ])

  return {
    stages: stageIndices.map((i) => ({
      stage: i + 1,
      winOdds: winOdds[i],
      setbackOdds: setbackOdds[i],
      setbackKeepBps: setbackKeepBps[i],
      potMinBps: potMinBps[i],
      potMaxBps: potMaxBps[i],
      repReward: repReward[i],
      supplyMix: { common: supplyMixRows[i][0], uncommon: supplyMixRows[i][1], rare: supplyMixRows[i][2] },
      jackpot: { triggerPct: jackpot[i][0], minMultBps: jackpot[i][1], maxMultBps: jackpot[i][2] },
    })),
    difficulties: difficulties.map(([repGate, cashEntry, active], i) => ({ difficulty: i, repGate, cashEntry, active })),
    ethAddOn,
    jackpotReserveBps,
    minCashStage,
    bustRepPenalty,
    idleTimeoutSeconds,
  }
}

async function fetchBoosts() {
  const totalTiers = Number(await read('DealersBoosts', 'totalTiers'))
  if (totalTiers === 0) throw new Error('No boost tiers configured on-chain')
  const tiers = await Promise.all(
    [...Array(totalTiers).keys()].map(async (i) => {
      const tierId = i + 1
      const t = await read('DealersBoosts', 'getBoostTier', [BigInt(tierId)])
      return {
        tierId,
        price: t.price,
        durationSeconds: t.duration,
        drugMultiplier: t.drugMultiplier,
        repMultiplier: t.repMultiplier,
        extraAttempts: t.extraAttempts,
        freeAreaMovement: t.freeAreaMovement,
        cashMultiplier: t.cashMultiplier,
        isActive: t.isActive,
      }
    })
  )
  return { tiers }
}

async function fetchNft() {
  const [[status, price, maxPerWallet, currentSupply, maxSupply], royaltyBps] = await Promise.all([
    read('DealersNFT', 'getMintConfig'),
    read('DealersNFT', 'ROYALTY_PERCENTAGE'),
  ])
  return {
    mintStatus: MINT_STATUS_NAMES[status] ?? `Unknown(${status})`,
    mintPrice: price,
    maxPerWallet,
    currentSupply,
    maxSupply,
    royaltyBps,
  }
}

async function fetchDrugs() {
  const drugIds = await read('DealersDrugRegistry', 'getAllDrugIds')
  return Promise.all(
    drugIds.map(async (id) => {
      const info = await read('DealersDrugRegistry', 'getDrugInfo', [id])
      return { id, name: info.name, rarity: RARITY_NAMES[info.rarity] ?? `Unknown(${info.rarity})`, baseCashValue: info.baseCashValue, isActive: info.isActive }
    })
  )
}

async function fetchAreas(drugs) {
  const drugNames = new Map(drugs.map((d) => [d.id, d.name]))
  const [totalAreas, blackMarketArea] = await Promise.all([
    read('DealersAreaRegistry', 'getTotalAreas'),
    read('DealersAreaRegistry', 'BLACK_MARKET_AREA'),
  ])
  const areaIds = [...Array(Number(totalAreas)).keys()].map((i) => i + 1).concat([Number(blackMarketArea)])

  return Promise.all(
    areaIds.map(async (areaId) => {
      const [info, drugIds] = await Promise.all([
        read('DealersAreaRegistry', 'getAreaInfo', [areaId]),
        read('DealersAreaRegistry', 'getAreaDrugIds', [areaId]),
      ])
      const areaDrugs = await Promise.all(
        drugIds.map(async (drugId) => {
          const cfg = await read('DealersAreaRegistry', 'getAreaDrugConfig', [areaId, drugId])
          return { drugId, name: drugNames.get(drugId) ?? `Drug ${drugId}`, buyPrice: cfg.buyPrice, sellPrice: cfg.sellPrice, isAvailable: cfg.isAvailable }
        })
      )
      return {
        id: areaId,
        name: info.name,
        movementFee: info.movementFee,
        minReputation: info.minReputation,
        isActive: info.isActive,
        isBlackMarket: areaId === Number(blackMarketArea),
        drugs: areaDrugs,
      }
    })
  )
}

async function main() {
  console.log(`Syncing chain config from ${network.name} (chain ${network.chainId}) via ${network.rpcUrl}`)

  const block = await client.getBlock()
  const drugs = await fetchDrugs()
  const [core, pvp, pve, heists, boosts, nft, blackMarketMinInfamy, areas] = await Promise.all([
    fetchCore(),
    read('DealersPVP', 'config'),
    fetchPve(),
    fetchHeists(),
    fetchBoosts(),
    fetchNft(),
    read('DealersActions', 'BLACK_MARKET_MIN_INFAMY'),
    fetchAreas(drugs),
  ])

  const snapshot = {
    network: networkKey,
    chainName: network.name,
    chainId: network.chainId,
    explorerUrl: network.explorerUrl,
    fetchedAt: {
      blockNumber: block.number,
      blockTimestamp: block.timestamp,
      iso: new Date(Number(block.timestamp) * 1000).toISOString(),
    },
    contracts: network.contracts,
    core,
    pvp,
    pve,
    heists,
    boosts,
    nft,
    actions: { blackMarketMinInfamy },
    drugs,
    areas,
  }

  const outPath = join(ROOT, 'generated', `chain-config.${networkKey}.json`)
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, JSON.stringify(snapshot, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2) + '\n')
  console.log(`Wrote ${outPath} (block ${block.number}, ${snapshot.fetchedAt.iso})`)
}

main().catch((err) => {
  console.error('Sync failed — snapshot not written.')
  console.error(err)
  process.exit(1)
})
