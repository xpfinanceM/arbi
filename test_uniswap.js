// Import required Node.js modules
const path = require('path');
const fs = require('fs');

// Resolve the path to the .env file
const envPath = path.resolve(__dirname, '.env');
// Check if the .env file exists
if (fs.existsSync(envPath)) {
    // If it exists, load environment variables from .env file
    require('dotenv').config({ path: envPath });
} else {
    // If .env file is not found, log an error and exit the process
    console.error('.env file not found');
    process.exit(1);
}

// Import the Uniswap interface and configuration
const uniswap = require('./src/dex/uniswap');
const config = require('./src/config/config');

// Check and log if API keys are set in the environment variables
console.log('Infura Key set:', process.env.INFURA_KEY ? 'Yes' : 'No');
console.log('Alchemy Key set:', process.env.ALCHEMY_KEY ? 'Yes' : 'No');

async function testUniswapPriceFetcher() {
    // Define the pairs you want to test
    // To add more pairs, simply add new objects to this array
    const pairs = [
        { pair: 'USDT-USDC', network: 'ethereum' },
        { pair: 'USDE-USDT', network: 'ethereum' },
        // Add more pairs here as needed, for example:
        // { pair: 'DAI-USDC', network: 'ethereum' },
        // { pair: 'WBTC-USDC', network: 'ethereum' },
        { pair: 'USDT-USDC', network: 'arbitrum' },
        { pair: 'WETH-USDC', network: 'arbitrum' },
    ];

    console.log('Fetching Uniswap prices...\n');
    
    for (const { pair, network } of pairs) {
        console.log(`Attempting to fetch price for ${pair} on ${network.toUpperCase()}:`);
        try {
            const result = await uniswap.getUniswapPrice(pair, network);
            
            console.log(`  Price: ${result.price.toFixed(6)}`);
            console.log(`  Fee Tier: ${result.feeTier}%`);
            
            const [token0Symbol, token1Symbol] = pair.split('-');
            console.log(`  1 ${token0Symbol} = ${result.price.toFixed(6)} ${token1Symbol}`);
            console.log(`  1 ${token1Symbol} = ${(1 / result.price).toFixed(6)} ${token0Symbol}`);
        } catch (error) {
            console.error(`Error fetching price for ${pair} on ${network}:`);
            console.error(`  Error message: ${error.message}`);
            if (error.stack) {
                console.error(`  Stack trace: ${error.stack}`);
            }
        }
        console.log();
    }
}

// Execute the testUniswapPriceFetcher function
testUniswapPriceFetcher().catch(error => {
    console.error('Unhandled error in testUniswapPriceFetcher:');
    console.error(error);
    if (error.stack) {
        console.error('Stack trace:');
        console.error(error.stack);
    }
});