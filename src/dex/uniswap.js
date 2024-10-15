const { ethers } = require('ethers');
const config = require('../config/config');

// ABIs for interacting with Uniswap contracts
const FACTORY_ABI = ['function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)'];
const POOL_ABI = [
    'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
    'function token0() external view returns (address)',
    'function token1() external view returns (address)'
];
const ERC20_ABI = ['function decimals() external view returns (uint8)'];

const FACTORY_ADDRESS = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
const FEE_TIERS = [100, 500, 3000, 10000]; // 0.01%, 0.05%, 0.3%, 1%

// Function to get Uniswap price for a token pair
async function getUniswapPrice(tokenPair, network = 'ethereum') {
    const [token0Symbol, token1Symbol] = tokenPair.split('-');
    const token0Address = config.tokens[token0Symbol][network];
    const token1Address = config.tokens[token1Symbol][network];

    console.log(`Checking pair ${tokenPair} on ${network}`);
    console.log(`Token addresses: ${token0Address}, ${token1Address}`);

    if (!token0Address || !token1Address) {
        throw new Error(`Token addresses not found for ${tokenPair} on ${network}`);
    }

    const provider = new ethers.JsonRpcProvider(config.networks[network]);
    
    let pool, fee;
    const factoryContract = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
    
    // Find the pool for the token pair
    for (fee of FEE_TIERS) {
        console.log(`Checking fee tier: ${fee}`);
        const poolAddress = await factoryContract.getPool(token0Address, token1Address, fee);
        console.log(`Pool address for ${token0Symbol}-${token1Symbol}: ${poolAddress}`);
        if (poolAddress !== ethers.ZeroAddress) {
            pool = new ethers.Contract(poolAddress, POOL_ABI, provider);
            break;
        }
    }
    
    // If no pool found, check reverse order
    if (!pool) {
        console.log(`No pool found for ${token0Symbol}-${token1Symbol}, checking reverse order`);
        for (fee of FEE_TIERS) {
            console.log(`Checking fee tier: ${fee}`);
            const poolAddress = await factoryContract.getPool(token1Address, token0Address, fee);
            console.log(`Pool address for ${token1Symbol}-${token0Symbol}: ${poolAddress}`);
            if (poolAddress !== ethers.ZeroAddress) {
                pool = new ethers.Contract(poolAddress, POOL_ABI, provider);
                break;
            }
        }
    }

    if (!pool) {
        throw new Error(`No Uniswap V3 pool found for ${tokenPair} on ${network}`);
    }
    
    // Get token information
    const [token0, token1] = await Promise.all([pool.token0(), pool.token1()]);
    const [decimals0, decimals1] = await Promise.all([
        new ethers.Contract(token0, ERC20_ABI, provider).decimals(),
        new ethers.Contract(token1, ERC20_ABI, provider).decimals()
    ]);
    
    // Get current price from pool
    const { tick } = await pool.slot0();
    let price = calculatePrice(Number(tick), Number(decimals0), Number(decimals1));
    
    const isReversed = token0.toLowerCase() !== token0Address.toLowerCase();
    if (isReversed) {
        price = 1 / price;
    }

    return {
        pair: tokenPair,
        network,
        price: price,
        feeTier: fee / 10000 // Convert to percentage
    };
}

function calculatePrice(tick, decimals0, decimals1) {
    const price = Math.pow(1.0001, tick);
    return price * Math.pow(10, decimals0 - decimals1);
}

module.exports = { getUniswapPrice };