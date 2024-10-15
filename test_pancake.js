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

// Import the PancakeSwap interface and configuration
const { getPancakeSwapPrice } = require('./src/dex/pancakeswap');
const config = require('./src/config/config');

async function testPancakeSwapPriceFetcher() {
    // Define token pairs and their respective networks to fetch prices for
    const pairs = [
        { pair: 'USDC-WBNB', network: 'bsc' },
        { pair: 'USDT-WBNB', network: 'bsc' },
        // Add more pairs as needed
    ];

    console.log('Fetching PancakeSwap prices...\n');

    for (const { pair, network } of pairs) {
        try {
            const result = await getPancakeSwapPrice(pair, network);
            console.log(`${pair} on ${network.toUpperCase()}:`);
            console.log(`  Price: ${Number(result.price).toFixed(6)}`);
            console.log(`  Fee: ${result.feeTier}%`);
            
            if (pair.includes('WBNB')) {
                const inversePrice = 1 / Number(result.price);
                console.log(`  1 WBNB = ${Number(result.price).toFixed(2)} USD`);
                console.log(`  1 USD = ${inversePrice.toFixed(6)} WBNB`);
            }
            console.log();
        } catch (error) {
            console.error(`Error fetching price for ${pair} on ${network}: ${error.message}\n`);
        }
    }
}

testPancakeSwapPriceFetcher().catch(error => {
    console.error('Unhandled error:', error);
});