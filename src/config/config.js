require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const infuraUrl = `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`;
const alchemyUrl = `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`;
// Add Base-specific Alchemy URL
const baseAlchemyUrl = `https://base-mainnet.g.alchemy.com/v2/${process.env.BASE_ALCHEMY_KEY}`;

module.exports = {
  infuraKey: process.env.INFURA_KEY,
  alchemyKey: process.env.ALCHEMY_KEY,
  coingeckoApiKey: process.env.COINGECKO_API_KEY,

  networks: {
    ethereum: infuraUrl,
    arbitrum: alchemyUrl,
    // Use Base-specific Alchemy URL
    base: baseAlchemyUrl,
    bsc: 'https://bsc-dataseed.binance.org'
  },

  tokens: {
    USDT: {
      ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      arbitrum: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      bsc: '0x55d398326f99059fF775485246999027B3197955',
      base: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'
    },
    USDC: {
      ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      arbitrum: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      bsc: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
      base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
    },
    USDE: {
      ethereum: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3',
    },
    WETH: {
      ethereum: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      arbitrum: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      base: '0x4200000000000000000000000000000000000006'
    },
    ARB: {
      arbitrum: '0x912CE59144191C1204E64559FE8253a0e49E6548'
    },
    USDBC: {
      base: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA'
    },
    WBNB: {
      bsc: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
    },
    // Add more tokens as needed
    AERO: {
      base: '0x940181a94A35A4569E4529A3CDfB74e38FD98631'
    }
  },

  factories: {
    pancakeswap: {
      bsc: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'
    },
    // Add Aero factory address
    aero: {
      base: '0x420DD381b31aEf6683db6B902084cB0FFECe40Da'
    }
  },

  fees: {
    pancakeswap: {
      bsc: 0.0025 // 0.25%
    },
    // Add Aero fee
    aero: {
      base: 0.003 // 0.3%
    }
  },

  dexes: {
    uniswap: {
      ethereum: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      arbitrum: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      base: '0x2626664c2603336E57B271c5C0b26F421741e481'
    },
    pancakeswap: {
      bsc: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
      ethereum: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
      arbitrum: '0x1b81D678ffb9C0263b24A97847620C99d213eB14',
    },
    // Add Aero router address
    aero: {
      base: '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43'
    }
  },

  arbitrageThreshold: 10, // in USD
  quotingInterval: 600000, // 10 minutes in milliseconds

  // Gas price settings
  gasPrice: {
    maxGwei: 100, // Maximum gas price in Gwei
    priorityFee: 2 // Priority fee in Gwei
  },

  // Slippage tolerance
  slippageTolerance: 0.005, // 0.5%

  // Maximum trade size
  maxTradeSize: {
    USDC: 10000, // Maximum trade size in USDC
    USDE: 10000  // Maximum trade size in USDE
  }
};