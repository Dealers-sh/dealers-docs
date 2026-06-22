import { Table } from 'nextra/components'
import { getChainConfig, tierNameForReputation } from '../../lib/chain-config.js'
import { ethFromWei, bpsPercent, bpsMultiplier, multiplierX100, duration, thousands, signed, percent } from '../../lib/format.js'

const STAGE_ROMAN = ['I', 'II', 'III', 'IV', 'V']

const BOOST_TIER_LORE = {
  1: '🧃 Grinder',
  2: '💎 Hustler',
  3: '👑 Kingpin',
  4: '🌹 Godfather',
}

const HEIST_JOB_LORE = {
  0: { label: 'Easy', cashJob: '🏬 Rob Store', supplyJob: '🪩 Clubbing' },
  1: { label: 'Medium', cashJob: '🏧 Crack ATM', supplyJob: '🧪 Cooking' },
  2: { label: 'Hard', cashJob: '🚛 CIT Truck', supplyJob: '🚢 The Docks' },
}

function Dash() {
  return '—'
}

function ChainTable({ headers, rows }) {
  return (
    <Table className="x:mt-6">
      <thead>
        <Table.Tr>
          {headers.map(({ label, align }) => (
            <Table.Th key={label} align={align}>
              {label}
            </Table.Th>
          ))}
        </Table.Tr>
      </thead>
      <tbody>
        {rows.map((cells, i) => (
          <Table.Tr key={i}>
            {cells.map((cell, j) => (
              <Table.Td key={j} align={headers[j].align}>
                {cell}
              </Table.Td>
            ))}
          </Table.Tr>
        ))}
      </tbody>
    </Table>
  )
}

export function RankLadderTable() {
  const tiers = getChainConfig().core.reputationTiers
  return (
    <ChainTable
      headers={[
        { label: 'Tier', align: 'right' },
        { label: 'Name', align: 'left' },
        { label: 'Min REP', align: 'right' },
        { label: 'Win', align: 'right' },
        { label: 'Tie', align: 'right' },
        { label: 'Loss', align: 'right' },
        { label: 'Per-action cap', align: 'right' },
      ]}
      rows={tiers.map((t, i) => [
        t.tier,
        t.tierName,
        i === tiers.length - 1 ? `${thousands(t.minReputation)}+` : thousands(t.minReputation),
        signed(t.winBonus),
        signed(t.tieBonus),
        signed(t.lossPenalty),
        t.repCap,
      ])}
    />
  )
}

export function BoostTiersTable() {
  const { tiers } = getChainConfig().boosts
  const base = getChainConfig().core.baseMaxAttempts
  return (
    <ChainTable
      headers={[
        { label: 'Tier', align: 'left' },
        { label: 'Price', align: 'left' },
        { label: 'Duration', align: 'left' },
        { label: 'Drug & Cash', align: 'left' },
        { label: 'Rep', align: 'left' },
        { label: 'Attempts', align: 'left' },
        { label: 'Free travel', align: 'left' },
      ]}
      rows={tiers
        .filter((t) => t.isActive)
        .map((t) => [
          BOOST_TIER_LORE[t.tierId] ?? `Tier ${t.tierId}`,
          `${ethFromWei(t.price)} ETH`,
          duration(t.durationSeconds),
          multiplierX100(t.drugMultiplier),
          multiplierX100(t.repMultiplier),
          `${base} → ${base + t.extraAttempts}`,
          t.freeAreaMovement ? '✓' : <Dash />,
        ])}
    />
  )
}

export function HeistJobsTable() {
  const { difficulties } = getChainConfig().heists
  return (
    <ChainTable
      headers={[
        { label: 'Difficulty', align: 'left' },
        { label: 'Cash Run job', align: 'left' },
        { label: 'Supply Run job', align: 'left' },
        { label: 'Rep gate', align: 'right' },
        { label: 'Stake', align: 'right' },
      ]}
      rows={difficulties
        .filter((d) => d.active)
        .map((d) => {
          const lore = HEIST_JOB_LORE[d.difficulty] ?? { label: `Difficulty ${d.difficulty}`, cashJob: '?', supplyJob: '?' }
          return [
            lore.label,
            lore.cashJob,
            lore.supplyJob,
            `${thousands(d.repGate)} (${tierNameForReputation(d.repGate)})`,
            <>
              {thousands(d.cashEntry)} <code>$CASH</code>
            </>,
          ]
        })}
    />
  )
}

export function HeistStagesTable() {
  const { stages } = getChainConfig().heists
  return (
    <ChainTable
      headers={[
        { label: 'Stage', align: 'right' },
        { label: 'Clean', align: 'right' },
        { label: 'Setback', align: 'right' },
        { label: 'Bust', align: 'right' },
        { label: 'Setback keeps', align: 'right' },
        { label: 'Pot range (× stake)', align: 'left' },
        { label: 'Rep on payout', align: 'right' },
      ]}
      rows={stages.map((s, i) => [
        STAGE_ROMAN[i],
        percent(s.winOdds),
        percent(s.setbackOdds),
        percent(100 - s.winOdds - s.setbackOdds),
        bpsPercent(s.setbackKeepBps),
        `${bpsMultiplier(s.potMinBps)}–${bpsMultiplier(s.potMaxBps)}×`,
        s.repReward === 0 ? <Dash /> : signed(s.repReward),
      ])}
    />
  )
}

export function SupplyMixTable() {
  const { stages } = getChainConfig().heists
  const cell = (v) => (v === 0 ? <Dash /> : percent(v))
  return (
    <ChainTable
      headers={[
        { label: 'Stage cashed', align: 'right' },
        { label: 'Common', align: 'right' },
        { label: 'Uncommon', align: 'right' },
        { label: 'Rare', align: 'right' },
      ]}
      rows={stages.map((s, i) => [STAGE_ROMAN[i], cell(s.supplyMix.common), cell(s.supplyMix.uncommon), cell(s.supplyMix.rare)])}
    />
  )
}

export function HeistJackpotTable() {
  const { stages } = getChainConfig().heists
  const last = stages.length - 1
  return (
    <ChainTable
      headers={[
        { label: 'Stage cleared', align: 'right' },
        { label: 'Trigger chance', align: 'right' },
        { label: 'Payout (× the add-on)', align: 'right' },
      ]}
      rows={stages.map((s, i) => {
        const payout = `${bpsMultiplier(s.jackpot.minMultBps)}–${bpsMultiplier(s.jackpot.maxMultBps)}×`
        return [STAGE_ROMAN[i], percent(s.jackpot.triggerPct), i === last ? <strong>{payout}</strong> : payout]
      })}
    />
  )
}

export function AreaAccessTable() {
  const { areas } = getChainConfig()
  return (
    <ChainTable
      headers={[
        { label: 'Area', align: 'left' },
        { label: 'Travel fee', align: 'right' },
        { label: 'Min REP', align: 'right' },
      ]}
      rows={areas
        .filter((a) => a.isActive && !a.isBlackMarket)
        .map((a) => [a.name, a.movementFee === '0' ? 'Free' : `${ethFromWei(a.movementFee)} ETH`, thousands(a.minReputation)])}
    />
  )
}

export function ContractAddressesTable() {
  const { contracts, explorerUrl } = getChainConfig()
  return (
    <ChainTable
      headers={[
        { label: 'Contract', align: 'left' },
        { label: 'Address', align: 'left' },
        { label: 'Explorer', align: 'left' },
      ]}
      rows={Object.entries(contracts).map(([name, address]) => [
        <code key="n">{name}</code>,
        <code key="a">{address}</code>,
        <a key="e" href={`${explorerUrl}/address/${address}`}>
          view
        </a>,
      ])}
    />
  )
}
