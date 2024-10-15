const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
} else {
    console.error('.env file not found');
    process.exit(1);
}

const { getAeroPrice } = require('./src/dex/aero');

async function testAeroPriceFetcher() {
    console.log('Fetching Aerodrome prices...');
    try {
      const pairs = [
        { pair: 'USDC-USDBC', poolAddress: '0x27a8Afa3Bd49406e48a074350fB7b2020c43B2bD' },
        
      ];

      for (const { pair, poolAddress } of pairs) {
        const result = await getAeroPrice(pair, 'base', poolAddress);
        console.log(`${result.pair} on ${result.network.toUpperCase()}:`);
        console.log(`  Price: ${result.price.toFixed(6)}`);
        console.log(`  1 ${result.token0Symbol} = ${result.price.toFixed(2)} ${result.token1Symbol}`);
        console.log(`  1 ${result.token1Symbol} = ${(1 / result.price).toFixed(6)} ${result.token0Symbol}`);
        console.log();
      }
    } catch (error) {
      console.error('Error fetching price:', error.message);
    }
  }


testAeroPriceFetcher().catch(console.error);