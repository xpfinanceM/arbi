const { ethers } = require('ethers');
const config = require('../config/config');

const FACTORY_ABI = ['function getPair(address tokenA, address tokenB) external view returns (address pair)'];
const PAIR_ABI = [
    'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
    'function token0() external view returns (address)',
    'function token1() external view returns (address)'
];
const ERC20_ABI = ['function decimals() external view returns (uint8)'];

const FACTORY_ADDRESS = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'; // PancakeSwap factory address on BSC

async function getPancakeSwapPrice(tokenPair, network = 'bsc') {
    const [token0Symbol, token1Symbol] = tokenPair.split('-');
    const token0Address = config.tokens[token0Symbol][network];
    const token1Address = config.tokens[token1Symbol][network];

    if (!token0Address || !token1Address) {
        throw new Error(`Token addresses not found for ${tokenPair} on ${network}`);
    }

    const provider = new ethers.JsonRpcProvider(config.networks[network]);
    const factoryContract = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
    
    const pairAddress = await factoryContract.getPair(token0Address, token1Address);
    
    if (pairAddress === ethers.ZeroAddress) {
        throw new Error(`No PancakeSwap pair found for ${tokenPair} on ${network}`);
    }

    const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);
    
    const [token0, token1] = await Promise.all([pairContract.token0(), pairContract.token1()]);
    const [decimals0, decimals1] = await Promise.all([
        new ethers.Contract(token0, ERC20_ABI, provider).decimals(),
        new ethers.Contract(token1, ERC20_ABI, provider).decimals()
    ]);
    
    const { reserve0, reserve1 } = await pairContract.getReserves();
    
    // Convert BigInt reserves to numbers and adjust for decimals
    const adjustedReserve0 = Number(reserve0) / Math.pow(10, Number(decimals0));
    const adjustedReserve1 = Number(reserve1) / Math.pow(10, Number(decimals1));
    
    let price = adjustedReserve1 / adjustedReserve0;
    
    const isReversed = token0.toLowerCase() !== token0Address.toLowerCase();
    if (isReversed) {
        price = 1 / price;
    }

    return {
        pair: tokenPair,
        network,
        price: Number(price), // Ensure price is always a number
        feeTier: 0.25 // PancakeSwap typically uses 0.25% fee
    };
}

module.exports = { getPancakeSwapPrice };