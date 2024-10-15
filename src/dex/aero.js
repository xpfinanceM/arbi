const { ethers } = require('ethers');
const config = require('../config/config');

const POOL_ABI = [
    'function getReserves() external view returns (uint256 reserve0, uint256 reserve1, uint32 blockTimestampLast)',
    'function token0() external view returns (address)',
    'function token1() external view returns (address)'
];

const ERC20_ABI = [
    'function decimals() external view returns (uint8)',
    'function symbol() external view returns (string)'
];

async function getAeroPrice(tokenPair, network = 'base', poolAddress) {
    if (!poolAddress) {
      throw new Error('Pool address is required for Aero');
    }
    const provider = new ethers.JsonRpcProvider(config.networks[network]);
    const poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider);

    

    try {
        console.log('Fetching token addresses...');
        const [token0, token1] = await Promise.all([
            poolContract.token0(),
            poolContract.token1()
        ]);

        console.log(`Token0: ${token0}`);
        console.log(`Token1: ${token1}`);

        console.log('Fetching reserves...');
        const reserves = await poolContract.getReserves();
        console.log(`Reserves: ${reserves[0]}, ${reserves[1]}`);

        const [token0Contract, token1Contract] = [
            new ethers.Contract(token0, ERC20_ABI, provider),
            new ethers.Contract(token1, ERC20_ABI, provider)
        ];

        console.log('Fetching token details...');
        const [decimals0, decimals1, symbol0, symbol1] = await Promise.all([
            token0Contract.decimals(),
            token1Contract.decimals(),
            token0Contract.symbol(),
            token1Contract.symbol()
        ]);

        console.log(`Token0 Symbol: ${symbol0}, Decimals: ${decimals0}`);
        console.log(`Token1 Symbol: ${symbol1}, Decimals: ${decimals1}`);

        const reserve0 = Number(ethers.formatUnits(reserves[0], decimals0));
        const reserve1 = Number(ethers.formatUnits(reserves[1], decimals1));
        const price = reserve1 / reserve0;

        return {
            pair: tokenPair,
            network,
            price: price,
            token0Symbol: symbol0,
            token1Symbol: symbol1
        };
    } catch (error) {
        console.error(`Error fetching data for ${tokenPair}:`, error);
        throw error;
    }
}

module.exports = { getAeroPrice };