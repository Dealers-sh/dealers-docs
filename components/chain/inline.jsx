import { getChainConfig, getChainValue, tierNameForReputation } from '../../lib/chain-config.js'
import { FORMATTERS, perMille } from '../../lib/format.js'

export function C({ path, format = 'raw' }) {
  const formatter = FORMATTERS[format]
  if (!formatter) {
    throw new Error(`Unknown format "${format}" for <C path="${path}">. Valid: ${Object.keys(FORMATTERS).join(', ')}`)
  }
  return formatter(getChainValue(path))
}

export function ExplorerLink() {
  const url = getChainValue('explorerUrl')
  return <a href={url}>{url.replace(/^https?:\/\//, '')}</a>
}

export function HeatRiskMax() {
  const { maxHeatLevel, config } = getChainConfig().core
  return perMille(maxHeatLevel * config.jailChancePerHeat)
}

export function TierNameForRep({ path }) {
  return tierNameForReputation(getChainValue(path))
}

export function HeistAllClearChance() {
  const odds = getChainConfig().heists.stages.reduce((acc, s) => acc * (s.winOdds / 100), 1)
  return `${(odds * 100).toFixed(0)}%`
}

export function AreaStat({ area, field, format = 'raw' }) {
  const match = getChainConfig().areas.find((a) => a.name === area)
  if (!match) throw new Error(`Area "${area}" not found in chain config snapshot`)
  if (!(field in match)) throw new Error(`Field "${field}" not found on area "${area}"`)
  return FORMATTERS[format](match[field])
}
