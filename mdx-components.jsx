import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { C, ExplorerLink, HeatRiskMax, TierNameForRep, HeistAllClearChance, AreaStat } from './components/chain/inline.jsx'
import {
  RankLadderTable,
  BoostTiersTable,
  HeistJobsTable,
  HeistStagesTable,
  SupplyMixTable,
  HeistJackpotTable,
  AreaAccessTable,
  ContractAddressesTable,
} from './components/chain/tables.jsx'

const docsComponents = getDocsMDXComponents()

export function useMDXComponents(components) {
  return {
    ...docsComponents,
    C,
    ExplorerLink,
    HeatRiskMax,
    TierNameForRep,
    HeistAllClearChance,
    AreaStat,
    RankLadderTable,
    BoostTiersTable,
    HeistJobsTable,
    HeistStagesTable,
    SupplyMixTable,
    HeistJackpotTable,
    AreaAccessTable,
    ContractAddressesTable,
    ...components
  }
}
