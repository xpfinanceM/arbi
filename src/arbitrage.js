const { getUniswapPrice } = require('./dex/uniswap');
const { getPancakeSwapPrice } = require('./dex/pancakeswap');
const config = require('./config/config');

async function fetchAllPrices(tokenPair) {
    const prices = {};
    for (const network of Object.keys(config.networks)) {
        try {
            if (config.dexes.uniswap[network]) {
                prices[`uniswap_${network}`] = await getUniswapPrice(tokenPair, network);
            }
            if (config.dexes.pancakeswap[network]) {
                prices[`pancakeswap_${network}`] = await getPancakeSwapPrice(tokenPair, network);
            }
        } catch (error) {
            console.error(`Error fetching price for ${tokenPair} on ${network}:`, error);
        }
    }
    return prices;
}

async function findArbitrageOpportunities() {
    const tokenPairs = ['USDC-USDT', 'USDC-PYUSD', 'USDT-PYUSD'];
    for (const pair of tokenPairs) {
        try {
            const prices = await fetchAllPrices(pair);
            
            // Analyze prices for arbitrage opportunities
            // Implement your arbitrage logic here
            console.log(`Prices for ${pair}:`, prices);
        } catch (error) {
            console.error(`Error processing ${pair}:`, error);
        }
    }
}

async function runArbitrageBot() {
    while (true) {
        try {   
            await findArbitrageOpportunities();
        } catch (error) {
            console.error('Error in arbitrage bot:', error);
        }
        // Wait for the configured interval before the next check
        await new Promise(resolve => setTimeout(resolve, config.quotingInterval));
    }
}

module.exports = {
    runArbitrageBot
};