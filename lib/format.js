const WEI_PER_ETH = 10n ** 18n
const MINUS = '−'

export function ethFromWei(wei) {
  const value = BigInt(wei)
  const whole = value / WEI_PER_ETH
  const frac = (value % WEI_PER_ETH).toString().padStart(18, '0').replace(/0+$/, '')
  return frac ? `${whole}.${frac}` : `${whole}`
}

export function percent(value) {
  return `${Number(value)}%`
}

export function perMille(value) {
  const pct = Number(value) / 10
  return `${Number.isInteger(pct) ? pct : pct.toFixed(1)}%`
}

export function bpsPercent(value) {
  const pct = Number(value) / 100
  return `${Number.isInteger(pct) ? pct : pct}%`
}

export function bpsMultiplier(value) {
  return (Number(value) / 10000).toFixed(1)
}

export function multiplierX100(value) {
  return `${(Number(value) / 100).toFixed(2)}×`
}

export function duration(seconds) {
  const s = Number(seconds)
  if (s % 86400 === 0) {
    const days = s / 86400
    return days === 1 ? '1 day' : `${days} days`
  }
  if (s % 3600 === 0) {
    const hours = s / 3600
    return hours === 1 ? '1 hour' : `${hours} hours`
  }
  return `${s} seconds`
}

export function thousands(value) {
  return Number(value).toLocaleString('en-US')
}

export function signed(value) {
  const n = Number(value)
  return n < 0 ? `${MINUS}${Math.abs(n)}` : `+${n}`
}

export const FORMATTERS = {
  eth: (v) => `${ethFromWei(v)} ETH`,
  ethBare: ethFromWei,
  percent,
  perMille,
  bpsPercent,
  bpsComplementPercent: (v) => bpsPercent(10000 - Number(v)),
  bpsX: (v) => `${bpsMultiplier(v)}×`,
  x100: multiplierX100,
  duration,
  number: thousands,
  signed,
  raw: (v) => String(v),
}
