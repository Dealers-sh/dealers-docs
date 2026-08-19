export const NETWORKS = {
  testnet: {
    name: 'Abstract Testnet',
    chainId: 11124,
    rpcUrl: 'https://api.testnet.abs.xyz',
    explorerUrl: 'https://sepolia.abscan.org',
    contracts: {
      DealersNFT: '0xCa4BC92b565A110952933C90f581A7765415e6Ed',
      DealersCore: '0x8dC006a61012F1a6f3EAd24eEfaf0e634d0635f4',
      DealersActions: '0x407B2507B7371834D7616E3F0A69274124119598',
      DealersPVE: '0x9D6dc92F71416943aB7ee2653c681dC403107149',
      DealersPVP: '0x73551b83d47Fd830d7571b4EB81059Ce92820F68',
      DealersHeists: '0x36B7941C93E7DaA916dbA0ea42841Fc54CbC2325',
      DealersBoosts: '0x6bD8B5D350798ad850F255Cb093D1be46Cc0B163',
      DEDrugRegistry: '0xe9260db65A5B62Ccc09da4100c47F66dC39b4a6B',
      DEAreaRegistry: '0x543513cea0Dfe318224508c5dD0E05298e776f44',
      DealersClaims: '0xaA6AfB0fCDB58135A12c06cD5b6D551A6507F14A',
      DealersMulticall: '0xF616a24AfC1C51B2514c5a7f63bcc792ac700F5b',
      DealersPaymentHandler: '0x759C484eAb3B56757E05597A5597bfC982BEAA76',
      DealersRandomness: '0x92bAeD7386ec8738075eD271cb3747CbFFA175c1',
      DealersChatFactory: '0x46309780bdFe7Fed9075dd0BC37E55c57D5C91a7',
      DealerRendererSVG: '0x026fE01BC06Bc56e52cdB77BF0Aba6c119d32583',
      DealerRendererHTML: '0x20cdad6AEC735B2FA65Edd35d18A55127cdD6C03',
    },
  },
  mainnet: {
    name: 'Abstract',
    chainId: 2741,
    rpcUrl: 'https://api.mainnet.abs.xyz',
    explorerUrl: 'https://explorer.abs.xyz',
    contracts: {
      DealersNFT: '0x610CcEe1AE4aFF961d043faB379491C2997383F7',
      DealersCore: '0x0D8d2755a49d30BD57F6a9bA5Fa8a7c9FFF86E8e',
      DealersActions: '0xa02bccd8Aa2b9067bf22213d25E7E73D3F6cDB6D',
      DealersPVE: '0x61Ee140E5757366ece5Ee89ea9688c0ea2da88e6',
      DealersPVP: '0x49090a745Ba1E45c9C0f9c21448Ce965b3798949',
      DealersHeists: '0x4B7A7E9dD2254c7848Def422cEB517AC6310C90e',
      DealersBankHeist: '0x987779Fd28E24D9cBeB7c22Eb1AFE1B7771ED5e1',
      DealersMissions: '0xaf461430D2e2cCd89CFE3Ee335F77a8BF3031F5b',
      DealersBoosts: '0x7cbE9cD59E6D9842b7d2EeBdd7E24836db64545B',
      DEDrugRegistry: '0xb89125a33eb5FD401a9ef66DECe2A6a060989CcC',
      DEAreaRegistry: '0xe7598E61738921967f888736A1977b80Da526510',
      DealersClaims: '0xdBDD44758Deb81B3D88766c6a6fc439960Ea4Ba8',
      DealersMulticall: '0x01C186418FE87F53E1A95dE49CCf13D501868669',
      DealersPaymentHandler: '0x798E0f15A34F491eF4A69E9CC626A625bb80A504',
      DealersRandomness: '0x76f965BdB22f482503Cf0de3C67394d987da400D',
      DealersChatFactory: '0xB13A49F39eD9146A89d917b4DB4beF1c143e2FFe',
      DealerRendererSVG: '0x8c99b0c302E774CF50ba6B4763dcB15d84ede31A',
      DealerRendererHTML: '0x889F5a12DaB04b3f5bB60672FDD599be8A0949d5',
    },
  },
}

export const ACTIVE_NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'mainnet'

export function getNetwork(key = ACTIVE_NETWORK) {
  const network = NETWORKS[key]
  if (!network) {
    throw new Error(`Unknown network "${key}". Valid networks: ${Object.keys(NETWORKS).join(', ')}`)
  }
  return network
}
