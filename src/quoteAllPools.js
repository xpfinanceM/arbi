const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Load environment variables
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log('.env file loaded successfully');
} else {
    console.error('.env file not found in the root folder');
    process.exit(1);
}

const { getPancakeSwapPrice } = require('./dex/pancakeswap');
const { getUniswapPrice } = require('./dex/uniswap');
const { getAeroPrice } = require('./dex/aero');

// Update the database path
const dbPath = path.join(__dirname, 'quotes.db');

// Initialize SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log(`Connected to the SQLite database at ${dbPath}`);
        db.run(`CREATE TABLE IF NOT EXISTS quotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            dex TEXT,
            NETWORK TEXT,
            pair TEXT,
            price REAL,
            quote_200 REAL,
            fee_tier REAL,
            logic TEXT
        )`, (createErr) => {
            if (createErr) {
                console.error('Error creating table:', createErr);
            } else {
                console.log('Quotes table created or already exists.');
            }
        });
    }
});

async function quoteAllPools() {
    const results = [];
    const dexes = [
        { name: 'Uniswap', network: 'ethereum', pair: 'USDC-USDT', func: getUniswapPrice },
        { name: 'Uniswap', network: 'arbitrum', pair: 'USDT-USDC', func: getUniswapPrice },
        { name: 'PancakeSwap', network: 'bsc', pair: 'USDT-USDC', func: getPancakeSwapPrice },
        { name: 'Aero', network: 'base', pair: 'USDC-USDBC', func: getAeroPrice, poolAddress: '0x27a8Afa3Bd49406e48a074350fB7b2020c43B2bD' },
    ];

    for (const dex of dexes) {
        try {
            let result;
            if (dex.name === 'Aero') {
                result = await dex.func(dex.pair, dex.network, dex.poolAddress);
            } else {
                result = await dex.func(dex.pair, dex.network);
            }

            const quote200 = result.price * 200;
            console.log(`${dex.name} (${dex.network}): ${dex.pair} - Price: ${result.price.toFixed(4)}, 200 units: ${quote200.toFixed(4)}`);

            results.push({ dex: dex.name, network: dex.network, ...result, quote200 });

            db.run(`INSERT INTO quotes (dex, NETWORK, pair, price, quote_200, fee_tier, logic) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [dex.name, dex.network, dex.pair, result.price, quote200, result.feeTier || null, null],
                (insertErr) => {
                    if (insertErr) {
                        console.error('Error inserting data:', insertErr);
                    }
                });
        } catch (error) {
            console.error(`Error fetching price for ${dex.pair} on ${dex.network} using ${dex.name}: ${error.message}`);
            results.push({ dex: dex.name, network: dex.network, pair: dex.pair, error: error.message });
        }
    }

    return results;
}

async function main() {
    try {
        const quotes = await quoteAllPools();
        console.log('\nAll quotes:', JSON.stringify(quotes, null, 2));
    } catch (error) {
        console.error('Error in main function:', error);
    } finally {
        db.close((closeErr) => {
            if (closeErr) {
                console.error('Error closing database:', closeErr);
            } else {
                console.log('Closed the database connection.');
            }
        });
    }
}

main().catch(error => {
    console.error('Unhandled error in main:', error);
    db.close();
});

process.on('exit', (code) => {
    console.log(`Exiting with code: ${code}`);
    console.log(`Database file should be at: ${dbPath}`);
    if (fs.existsSync(dbPath)) {
        console.log(`Database file exists. Size: ${fs.statSync(dbPath).size} bytes`);
    } else {
        console.log('Database file does not exist!');
    }
});